import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/hooks/use-toast"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { CalendarIcon, DollarSign, Building2, CreditCard, Users } from "lucide-react"
import { Despesa, ContaBancaria, Empresa, financialDataService } from "@/services/financialData"

const pagamentoSchema = z.object({
  contaBancariaId: z.string().min(1, "Conta bancária é obrigatória"),
  valor: z.number().min(0.01, "Valor deve ser maior que zero"),
  dataPagamento: z.date(),
  descricao: z.string().min(1, "Descrição é obrigatória"),
  numeroDocumento: z.string().optional()
})

type PagamentoFormData = z.infer<typeof pagamentoSchema>

interface ModalBaixaDespesaProps {
  despesas: Despesa[]
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function ModalBaixaDespesa({ despesas, isOpen, onClose, onSuccess }: ModalBaixaDespesaProps) {
  const [contasBancarias, setContasBancarias] = useState<ContaBancaria[]>([])
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [abaSelecionada, setAbaSelecionada] = useState("individual")
  const [despesaSelecionada, setDespesaSelecionada] = useState<Despesa | null>(null)
  const [valorTotalSelecionadas, setValorTotalSelecionadas] = useState(0)

  const form = useForm<PagamentoFormData>({
    resolver: zodResolver(pagamentoSchema),
    defaultValues: {
      contaBancariaId: "",
      valor: 0,
      dataPagamento: new Date(),
      descricao: despesa ? `Pagamento - ${despesa.descricao}` : "Pagamento",
      numeroDocumento: ""
    }
  })

  useEffect(() => {
    if (isOpen && despesas.length > 0) {
      const contas = financialDataService.getContasBancarias().filter(c => c.ativa)
      setContasBancarias(contas)
      
      const empresasData = financialDataService.getEmpresas()
      setEmpresas(empresasData)
      
      // Calcular valor total das despesas selecionadas
      const total = despesas.reduce((sum, despesa) => {
        const pagamentosExistentes = financialDataService.getPagamentos()
          .filter(p => p.despesaId === despesa.id)
          .reduce((total, p) => total + p.valor, 0)
        return sum + (despesa.valor - pagamentosExistentes)
      }, 0)
      
      setValorTotalSelecionadas(total)
      
      // Se apenas uma despesa, selecionar automaticamente
      if (despesas.length === 1) {
        setDespesaSelecionada(despesas[0])
        setAbaSelecionada("individual")
      } else {
        setDespesaSelecionada(null)
        setAbaSelecionada("individual")
      }
      
      form.reset({
        contaBancariaId: "",
        valor: despesas.length === 1 ? total : 0,
        dataPagamento: new Date(),
        descricao: despesas.length === 1 ? `Pagamento - ${despesas[0].descricao}` : "Pagamento",
        numeroDocumento: ""
      })
    }
  }, [isOpen, despesas, form])

  const onSubmit = async (data: PagamentoFormData) => {
    try {
      if (abaSelecionada === 'individual' && despesaSelecionada) {
        // Pagamento individual
        const valorRestante = getValorRestanteDespesa(despesaSelecionada)
        
        if (data.valor > valorRestante) {
          toast({
            title: "Valor inválido",
            description: "O valor do pagamento não pode ser maior que o valor restante da despesa.",
            variant: "destructive"
          })
          return
        }

        const pagamento = {
          id: Date.now().toString(),
          despesaId: despesaSelecionada.id,
          contaBancariaId: data.contaBancariaId,
          valor: data.valor,
          dataPagamento: data.dataPagamento,
          numeroDocumento: data.numeroDocumento || '',
          observacoes: data.descricao || ''
        }

        financialDataService.addPagamento(pagamento)

        toast({
          title: "Sucesso!",
          description: "Pagamento registrado com sucesso.",
        })
      } else if (abaSelecionada === 'lote') {
        // Pagamento em lote
        const valorPorDespesa = data.valor / despesas.length
        
        for (const despesa of despesas) {
          const pagamento = {
            id: `${Date.now()}_${despesa.id}`,
            despesaId: despesa.id,
            contaBancariaId: data.contaBancariaId,
            valor: valorPorDespesa,
            dataPagamento: data.dataPagamento,
            numeroDocumento: data.numeroDocumento || '',
            observacoes: data.descricao || `Pagamento em lote - ${despesa.descricao}`
          }

          financialDataService.addPagamento(pagamento)
        }

        toast({
          title: "Sucesso!",
          description: `${despesas.length} pagamentos registrados com sucesso.`,
        })
      }

      onSuccess()
      onClose()
    } catch (error) {
      toast({
        title: "Erro!",
        description: "Erro ao registrar pagamento(s).",
        variant: "destructive"
      })
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const getValorRestanteDespesa = (despesa: Despesa) => {
    const pagamentosExistentes = financialDataService.getPagamentos()
      .filter(p => p.despesaId === despesa.id)
      .reduce((total, p) => total + p.valor, 0)
    return despesa.valor - pagamentosExistentes
  }

  const handleValorPreDefinido = (tipo: 'total' | 'metade') => {
    if (abaSelecionada === 'individual' && despesaSelecionada) {
      const valorRestante = getValorRestanteDespesa(despesaSelecionada)
      const valor = tipo === 'total' ? valorRestante : valorRestante / 2
      form.setValue('valor', valor)
    } else if (abaSelecionada === 'lote') {
      const valor = tipo === 'total' ? valorTotalSelecionadas : valorTotalSelecionadas / 2
      form.setValue('valor', valor)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pendente: { label: "Pendente", variant: "secondary" as const },
      pago_parcial: { label: "Pago Parcial", variant: "default" as const },
      pago_total: { label: "Pago", variant: "default" as const },
      vencido: { label: "Vencido", variant: "destructive" as const }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pendente
    
    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    )
  }
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            {despesas.length === 1 ? 'Registrar Pagamento' : 'Registrar Pagamentos'}
          </DialogTitle>
          <DialogDescription>
            {despesas.length === 1 
              ? `Registre o pagamento da despesa: ${despesas[0].descricao}`
              : `Registre o pagamento de ${despesas.length} despesas selecionadas`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6">
          {/* Resumo das Despesas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                {despesas.length === 1 ? 'Informações da Despesa' : 'Resumo das Despesas'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {despesas.length === 1 ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Fornecedor</p>
                    <p className="text-sm">{despesas[0].fornecedor}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Categoria</p>
                    <p className="text-sm">{despesas[0].categoria}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Valor Total</p>
                    <p className="text-sm font-semibold">{formatCurrency(despesas[0].valor)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Valor Restante</p>
                    <p className="text-sm font-semibold text-green-600">{formatCurrency(getValorRestanteDespesa(despesas[0]))}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-muted-foreground">Vencimento</p>
                    <p className="text-sm">{format(new Date(despesas[0].vencimento), 'dd/MM/yyyy', { locale: ptBR })}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total de Despesas</p>
                      <p className="text-lg font-semibold">{despesas.length}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Valor Total</p>
                      <p className="text-lg font-semibold">{formatCurrency(despesas.reduce((sum, d) => sum + d.valor, 0))}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Valor Restante</p>
                      <p className="text-lg font-semibold text-green-600">{formatCurrency(valorTotalSelecionadas)}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="max-h-32 overflow-y-auto space-y-2">
                    {despesas.map((despesa) => (
                      <div key={despesa.id} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                        <div>
                          <p className="text-sm font-medium">{despesa.fornecedor}</p>
                          <p className="text-xs text-muted-foreground">{despesa.descricao}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">{formatCurrency(despesa.valor)}</p>
                          <p className="text-xs text-green-600">{formatCurrency(getValorRestanteDespesa(despesa))} restante</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Tabs value={abaSelecionada} onValueChange={setAbaSelecionada} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="individual" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Pagamento Individual
              </TabsTrigger>
              <TabsTrigger value="lote" className="flex items-center gap-2" disabled={despesas.length === 1}>
                <Users className="h-4 w-4" />
                Pagamento em Lote
              </TabsTrigger>
            </TabsList>

            <TabsContent value="individual" className="space-y-6">
              {despesas.length > 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Selecionar Despesa</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Select value={despesaSelecionada?.id || ''} onValueChange={(value) => {
                      const despesa = despesas.find(d => d.id === value)
                      setDespesaSelecionada(despesa || null)
                      if (despesa) {
                        const valorRestante = getValorRestanteDespesa(despesa)
                        form.setValue('valor', valorRestante)
                      }
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma despesa para pagar" />
                      </SelectTrigger>
                      <SelectContent>
                        {despesas.map((despesa) => (
                          <SelectItem key={despesa.id} value={despesa.id}>
                            {despesa.fornecedor} - {despesa.descricao} ({formatCurrency(getValorRestanteDespesa(despesa))} restante)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
              )}

              {(despesas.length === 1 || despesaSelecionada) && (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="contaBancariaId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Conta Bancária</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione a conta para débito" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {contasBancarias.map(conta => (
                                  <SelectItem key={conta.id} value={conta.id}>
                                    <div className="flex items-center gap-2">
                                      <Building2 className="w-4 h-4" />
                                      <span>{conta.nome} - {conta.banco}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="space-y-2">
                        <FormField
                          control={form.control}
                          name="valor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Valor do Pagamento</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  step="0.01" 
                                  placeholder="0.00" 
                                  {...field} 
                                  onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleValorPreDefinido('metade')}
                          >
                            50%
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleValorPreDefinido('total')}
                          >
                            Total
                          </Button>
                        </div>
                      </div>

                      <FormField
                        control={form.control}
                        name="dataPagamento"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Data do Pagamento</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "dd/MM/yyyy", { locale: ptBR })
                                    ) : (
                                      <span>Selecione a data</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <CalendarComponent
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  initialFocus
                                  disabled={(date) =>
                                    date > new Date() || date < new Date("1900-01-01")
                                  }
                                  locale={ptBR}
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="descricao"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Descrição</FormLabel>
                            <FormControl>
                              <Input placeholder="Descrição do pagamento" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="numeroDocumento"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Número do Documento (Opcional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: 001234, TED123, PIX456" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                      <Button type="button" variant="outline" onClick={onClose}>
                        Cancelar
                      </Button>
                      <Button type="submit">
                        Registrar Pagamento
                      </Button>
                    </div>
                  </form>
                </Form>
              )}
            </TabsContent>

            <TabsContent value="lote" className="space-y-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="contaBancariaId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Conta Bancária</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione a conta para débito" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {contasBancarias.map(conta => (
                                <SelectItem key={conta.id} value={conta.id}>
                                  <div className="flex items-center gap-2">
                                    <Building2 className="w-4 h-4" />
                                    <span>{conta.nome} - {conta.banco}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-2">
                      <FormField
                        control={form.control}
                        name="valor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Valor Total do Lote</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.01" 
                                placeholder="0.00" 
                                {...field} 
                                onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleValorPreDefinido('metade')}
                        >
                          50% ({formatCurrency(valorTotalSelecionadas / 2)})
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleValorPreDefinido('total')}
                        >
                          Total ({formatCurrency(valorTotalSelecionadas)})
                        </Button>
                      </div>
                    </div>

                    <FormField
                      control={form.control}
                      name="dataPagamento"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data do Pagamento</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "dd/MM/yyyy", { locale: ptBR })
                                  ) : (
                                    <span>Selecione a data</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <CalendarComponent
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                                disabled={(date) =>
                                  date > new Date() || date < new Date("1900-01-01")
                                }
                                locale={ptBR}
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="descricao"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição</FormLabel>
                          <FormControl>
                            <Input placeholder="Descrição do pagamento em lote" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="numeroDocumento"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número do Documento (Opcional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: 001234, TED123, PIX456" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={onClose}>
                      Cancelar
                    </Button>
                    <Button type="submit">
                      Registrar Pagamentos
                    </Button>
                  </div>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
