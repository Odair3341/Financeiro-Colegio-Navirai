import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { CalendarIcon, Building2, Receipt, DollarSign } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { DatabaseService } from '../services/database'
import type { Despesa, ContaBancaria, Empresa } from '../services/financialData'

const pagamentoSchema = z.object({
  contaBancariaId: z.string().min(1, 'Selecione uma conta bancária'),
  valor: z.number().min(0.01, 'Valor deve ser maior que zero'),
  dataPagamento: z.date({ required_error: 'Selecione a data do pagamento' }),
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  numeroDocumento: z.string().optional()
})

type PagamentoFormData = z.infer<typeof pagamentoSchema>

interface ModalBaixaDespesaProps {
  isOpen: boolean
  onClose: () => void
  despesas: Despesa[]
  onSuccess: () => void
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

export function ModalBaixaDespesa({ isOpen, onClose, despesas, onSuccess }: ModalBaixaDespesaProps) {
  const [contasBancarias, setContasBancarias] = useState<ContaBancaria[]>([])
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [despesaSelecionada, setDespesaSelecionada] = useState<Despesa | null>(null)
  const [loading, setLoading] = useState(false)

  const form = useForm<PagamentoFormData>({
    resolver: zodResolver(pagamentoSchema),
    defaultValues: {
      contaBancariaId: '',
      valor: 0,
      dataPagamento: new Date(),
      descricao: '',
      numeroDocumento: ''
    }
  })

  useEffect(() => {
    if (isOpen) {
      carregarDados()
      if (despesas.length === 1) {
        setDespesaSelecionada(despesas[0])
        const valorRestante = getValorRestanteDespesa(despesas[0])
        form.setValue('valor', valorRestante)
        form.setValue('descricao', `Pagamento - ${despesas[0].descricao}`)
      } else {
        setDespesaSelecionada(null)
        form.reset()
      }
    }
  }, [isOpen, despesas])

  const carregarDados = async () => {
    try {
      const [contasData, empresasData] = await Promise.all([
        DatabaseService.query('SELECT * FROM contas_bancarias WHERE ativo = true ORDER BY nome'),
        DatabaseService.query('SELECT * FROM empresas WHERE ativo = true ORDER BY nome')
      ])
      setContasBancarias(contasData)
      setEmpresas(empresasData)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      toast.error('Erro ao carregar dados')
    }
  }

  const getValorRestanteDespesa = (despesa: Despesa): number => {
    return despesa.valor - (despesa.valorPago || 0)
  }

  const valorTotalSelecionadas = despesas.reduce((total, despesa) => {
    return total + getValorRestanteDespesa(despesa)
  }, 0)

  const handleValorPreDefinido = (tipo: 'metade' | 'total') => {
    if (despesas.length === 1 || despesaSelecionada) {
      const despesa = despesaSelecionada || despesas[0]
      const valorRestante = getValorRestanteDespesa(despesa)
      const valor = tipo === 'metade' ? valorRestante / 2 : valorRestante
      form.setValue('valor', valor)
    } else {
      const valor = tipo === 'metade' ? valorTotalSelecionadas / 2 : valorTotalSelecionadas
      form.setValue('valor', valor)
    }
  }

  const onSubmit = async (data: PagamentoFormData) => {
    setLoading(true)
    try {
      const activeTab = document.querySelector('[data-state="active"]')?.getAttribute('data-value')
      
      if (activeTab === 'individual') {
        await processarPagamentoIndividual(data)
      } else {
        await processarPagamentoLote(data)
      }
      
      toast.success('Pagamento registrado com sucesso!')
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Erro ao registrar pagamento:', error)
      toast.error('Erro ao registrar pagamento')
    } finally {
      setLoading(false)
    }
  }

  const processarPagamentoIndividual = async (data: PagamentoFormData) => {
    const despesa = despesaSelecionada || despesas[0]
    if (!despesa) throw new Error('Nenhuma despesa selecionada')

    const valorRestante = getValorRestanteDespesa(despesa)
    if (data.valor > valorRestante) {
      throw new Error('Valor do pagamento não pode ser maior que o valor restante da despesa')
    }

    await DatabaseService.transaction(async () => {
      // Registrar o pagamento
      await DatabaseService.query(
        `INSERT INTO pagamentos (despesa_id, conta_bancaria_id, valor, data_pagamento, descricao, numero_documento, created_at)
         VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
        [despesa.id, data.contaBancariaId, data.valor, data.dataPagamento.toISOString(), data.descricao, data.numeroDocumento || null]
      )

      // Atualizar valor pago da despesa
      const novoValorPago = (despesa.valorPago || 0) + data.valor
      const status = novoValorPago >= despesa.valor ? 'paga' : 'parcial'
      
      await DatabaseService.query(
        'UPDATE despesas SET valor_pago = ?, status = ? WHERE id = ?',
        [novoValorPago, status, despesa.id]
      )

      // Atualizar saldo da conta bancária
      await DatabaseService.query(
        'UPDATE contas_bancarias SET saldo = saldo - ? WHERE id = ?',
        [data.valor, data.contaBancariaId]
      )
    })
  }

  const processarPagamentoLote = async (data: PagamentoFormData) => {
    if (data.valor > valorTotalSelecionadas) {
      throw new Error('Valor do lote não pode ser maior que o valor total das despesas')
    }

    await DatabaseService.transaction(async () => {
      let valorRestante = data.valor
      
      for (const despesa of despesas) {
        if (valorRestante <= 0) break
        
        const valorRestanteDespesa = getValorRestanteDespesa(despesa)
        const valorPagamento = Math.min(valorRestante, valorRestanteDespesa)
        
        if (valorPagamento > 0) {
          // Registrar o pagamento
          await DatabaseService.query(
            `INSERT INTO pagamentos (despesa_id, conta_bancaria_id, valor, data_pagamento, descricao, numero_documento, created_at)
             VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
            [despesa.id, data.contaBancariaId, valorPagamento, data.dataPagamento.toISOString(), 
             `${data.descricao} (Lote)`, data.numeroDocumento || null]
          )

          // Atualizar valor pago da despesa
          const novoValorPago = (despesa.valorPago || 0) + valorPagamento
          const status = novoValorPago >= despesa.valor ? 'paga' : 'parcial'
          
          await DatabaseService.query(
            'UPDATE despesas SET valor_pago = ?, status = ? WHERE id = ?',
            [novoValorPago, status, despesa.id]
          )
          
          valorRestante -= valorPagamento
        }
      }

      // Atualizar saldo da conta bancária
      await DatabaseService.query(
        'UPDATE contas_bancarias SET saldo = saldo - ? WHERE id = ?',
        [data.valor, data.contaBancariaId]
      )
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Baixa de Despesas
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Resumo das despesas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Resumo das Despesas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Quantidade</p>
                  <p className="text-2xl font-bold">{despesas.length}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Valor Total</p>
                  <p className="text-2xl font-bold">{formatCurrency(valorTotalSelecionadas)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Valor Médio</p>
                  <p className="text-2xl font-bold">{formatCurrency(valorTotalSelecionadas / despesas.length)}</p>
                </div>
              </div>
              
              {despesas.length > 1 && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Despesas Selecionadas:</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {despesas.map((despesa) => (
                      <div key={despesa.id} className="flex justify-between items-center p-2 bg-muted rounded">
                        <span className="text-sm">{despesa.fornecedor} - {despesa.descricao}</span>
                        <span className="font-medium">{formatCurrency(getValorRestanteDespesa(despesa))}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Tabs defaultValue="individual" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="individual">Pagamento Individual</TabsTrigger>
              <TabsTrigger value="lote">Pagamento em Lote</TabsTrigger>
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
                      <Button type="submit" disabled={loading}>
                        {loading ? 'Processando...' : 'Registrar Pagamento'}
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
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Processando...' : 'Registrar Pagamentos'}
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
