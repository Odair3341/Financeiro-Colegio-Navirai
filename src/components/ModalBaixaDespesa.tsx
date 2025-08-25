
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
  dataPagamento: z.date(),
  descricao: z.string().optional(),
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
  const [totalAPagar, setTotalAPagar] = useState(0)

  const form = useForm<PagamentoFormData>({
    resolver: zodResolver(pagamentoSchema),
    defaultValues: {
      contaBancariaId: "",
      dataPagamento: new Date(),
      descricao: "",
    }
  })

  useEffect(() => {
    if (isOpen && despesas.length > 0) {
      const contas = financialDataService.getContasBancarias().filter(c => c.ativa)
      setContasBancarias(contas)
      
      const total = despesas.reduce((acc, despesa) => acc + (despesa.valor - (despesa.valorPago || 0)), 0)
      setTotalAPagar(total)
      
      form.reset({
        contaBancariaId: "",
        dataPagamento: new Date(),
        descricao: `Pagamento de ${despesas.length} despesa(s)`,
      })
    }
  }, [isOpen, despesas, form])

  if (despesas.length === 0) {
    return null
  }

  const onSubmit = (data: PagamentoFormData) => {
    try {
      console.log('🚀 DEBUG MODAL: Iniciando pagamento em lote')
      console.log('📄 DEBUG MODAL: Despesas selecionadas:', despesas.map(d => d.id))

      despesas.forEach(despesa => {
        const valorRestante = despesa.valor - (despesa.valorPago || 0)
        if (valorRestante <= 0) return;

        const pagamentoData = {
          despesaId: despesa.id,
          contaBancariaId: data.contaBancariaId,
          valor: valorRestante, // Paga o valor total restante de cada despesa
          dataPagamento: format(data.dataPagamento, 'yyyy-MM-dd'),
          descricao: data.descricao || `Pagamento - ${despesa.descricao}`,
        }

        console.log('💾 DEBUG MODAL: Dados do pagamento para despesa', despesa.id, pagamentoData)
        financialDataService.registrarPagamento(pagamentoData)
      })
      
      toast({
        title: "Pagamentos Registrados",
        description: `${despesas.length} despesa(s) foram baixadas com sucesso.`
      })
      
      console.log('🔚 DEBUG MODAL: Fechando modal e chamando onSuccess')
      onClose()
      onSuccess()
    } catch (error) {
      console.error('❌ DEBUG MODAL: Erro ao registrar pagamentos em lote:', error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao registrar os pagamentos.",
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Baixar Despesas em Lote</DialogTitle>
          <DialogDescription>
            Registre o pagamento para as {despesas.length} despesas selecionadas.
          </DialogDescription>
        </DialogHeader>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Resumo do Pagamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total de Despesas:</span>
                <span className="font-medium">{despesas.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Valor Total a Pagar:</span>
                <p className="font-bold text-lg">{formatCurrency(totalAPagar)}</p>
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
                  <FormLabel>Conta Bancária de Origem</FormLabel>
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
                  <FormLabel>Descrição Geral (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Pagamento de contas da semana" {...field} />
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
                Registrar Pagamentos
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
