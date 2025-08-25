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
import { toast } from "@/hooks/use-toast"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { CalendarIcon, DollarSign, Building2 } from "lucide-react"
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
  despesa: Despesa | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function ModalBaixaDespesa({ despesa, isOpen, onClose, onSuccess }: ModalBaixaDespesaProps) {
  const [contasBancarias, setContasBancarias] = useState<ContaBancaria[]>([])
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [valorRestante, setValorRestante] = useState(0)

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
    if (isOpen && despesa) {
      const contas = financialDataService.getContasBancarias().filter(c => c.ativa)
      setContasBancarias(contas)
      
      const empresasData = financialDataService.getEmpresas()
      setEmpresas(empresasData)
      
      const restante = despesa.valor - (despesa.valorPago || 0)
      setValorRestante(restante)
      
      form.reset({
        contaBancariaId: "",
        valor: restante,
        dataPagamento: new Date(),
        descricao: `Pagamento - ${despesa.descricao}`,
        numeroDocumento: ""
      })
    }
  }, [isOpen, despesa, form])

  if (!despesa) {
    return null
  }

  const onSubmit = (data: PagamentoFormData) => {
    if (!despesa) return
    
    try {
      console.log('DEBUG MODAL: Despesa ID:', despesa.id)
      console.log('DEBUG MODAL: Despesa valor:', despesa.valor)
      console.log('DEBUG MODAL: Despesa valorPago:', despesa.valorPago)
      
      const valorRestante = despesa.valor - (despesa.valorPago || 0)
      
      if (data.valor > valorRestante) {
        toast({
          title: "Valor inválido",
          description: "O valor do pagamento não pode ser maior que o valor restante da despesa.",
          variant: "destructive"
        })
        return
      }

      const pagamentoData = {
        despesaId: despesa.id,
        contaBancariaId: data.contaBancariaId,
        valor: data.valor,
        dataPagamento: format(data.dataPagamento, 'yyyy-MM-dd'),
        descricao: data.descricao,
        numeroDocumento: data.numeroDocumento || undefined
      }

      console.log('DEBUG MODAL: Registrando pagamento:', pagamentoData)
      financialDataService.registrarPagamento(pagamentoData)
      
      toast({
        title: "Pagamento registrado",
        description: "O pagamento foi registrado com sucesso e a despesa foi atualizada."
      })
      
      onClose()
      onSuccess()
    } catch (error) {
      console.error('DEBUG MODAL: Erro ao registrar pagamento:', error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao registrar o pagamento.",
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

  const handleValorPreDefinido = (tipo: 'total' | 'metade') => {
    if (!despesa) return
    const valorRestante = despesa.valor - (despesa.valorPago || 0)
    const valor = tipo === 'total' ? valorRestante : valorRestante / 2
    form.setValue('valor', valor)
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Baixar Despesa</DialogTitle>
          <DialogDescription>
            Registre o pagamento da despesa selecionada
          </DialogDescription>
        </DialogHeader>

        {/* Informações da Despesa */}
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  {despesa.descricao}
                </CardTitle>
                <CardDescription>
                  {despesa.empresa?.nome} • {despesa.fornecedor?.nome} • {despesa.categoria}
                </CardDescription>
              </div>
              {getStatusBadge(despesa.status)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Valor Total:</span>
                <p className="font-bold text-lg">{formatCurrency(despesa.valor)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Valor Pago:</span>
                <p className="font-medium text-green-600">{formatCurrency(despesa.valorPago)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Valor Restante:</span>
                <p className="font-bold text-orange-600">{formatCurrency(valorRestante)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Vencimento:</span>
                <p className="font-medium">
                  {format(new Date(despesa.vencimento), "dd/MM/yyyy", { locale: ptBR })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                  50% ({formatCurrency(valorRestante / 2)})
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleValorPreDefinido('total')}
                >
                  Total ({formatCurrency(valorRestante)})
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
                        className="pointer-events-auto"
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
      </DialogContent>
    </Dialog>
  )
}
