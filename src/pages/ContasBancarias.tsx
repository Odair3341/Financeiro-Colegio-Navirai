import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Building2, Eye, EyeOff, Upload, FileSpreadsheet, ArrowRight, Info, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ContaBancaria, financialDataService } from "@/services/financialData"
import { Link } from "react-router-dom"
import ImportOFXInstructions from "@/components/ImportOFXInstructions"


const contaSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  banco: z.string().min(1, "Banco é obrigatório"),
  agencia: z.string().min(1, "Agência é obrigatória"),
  conta: z.string().min(1, "Conta é obrigatória"),
  tipo: z.enum(["corrente", "poupanca", "aplicacao"]),
  saldo: z.number().min(0, "Saldo deve ser positivo"),
  ativa: z.boolean()
})

type ContaFormData = z.infer<typeof contaSchema>

const ContasBancarias = () => {
  const [contas, setContas] = useState<ContaBancaria[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingConta, setEditingConta] = useState<ContaBancaria | null>(null)
  const [showSaldos, setShowSaldos] = useState(false)

  const form = useForm<ContaFormData>({
    resolver: zodResolver(contaSchema),
    defaultValues: {
      nome: "",
      banco: "",
      agencia: "",
      conta: "",
      tipo: "corrente",
      saldo: 0,
      ativa: true
    }
  })

  useEffect(() => {
    loadContas()
  }, [])

  const loadContas = () => {
    const contasData = financialDataService.getContasBancarias()
    setContas(contasData)
  }

  const onSubmit = (data: ContaFormData) => {
    try {
      if (editingConta) {
        financialDataService.updateContaBancaria(editingConta.id, data as ContaBancaria)
        toast({
          title: "Conta atualizada",
          description: "A conta bancária foi atualizada com sucesso."
        })
      } else {
        financialDataService.saveContaBancaria(data as Omit<ContaBancaria, 'id' | 'createdAt' | 'updatedAt'>)
        toast({
          title: "Conta criada",
          description: "A conta bancária foi criada com sucesso."
        })
      }
      
      loadContas()
      setIsDialogOpen(false)
      setEditingConta(null)
      form.reset()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar a conta bancária.",
        variant: "destructive"
      })
    }
  }

  const handleEdit = (conta: ContaBancaria) => {
    setEditingConta(conta)
    form.reset({
      nome: conta.nome,
      banco: conta.banco,
      agencia: conta.agencia,
      conta: conta.conta,
      tipo: conta.tipo,
      saldo: conta.saldo,
      ativa: conta.ativa
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta conta bancária?")) {
      try {
        financialDataService.deleteContaBancaria(id)
        loadContas()
        toast({
          title: "Conta excluída",
          description: "A conta bancária foi excluída com sucesso."
        })
      } catch (error) {
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao excluir a conta bancária.",
          variant: "destructive"
        })
      }
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const getTipoLabel = (tipo: string) => {
    const tipos = {
      corrente: "Conta Corrente",
      poupanca: "Poupança",
      aplicacao: "Aplicação"
    }
    return tipos[tipo as keyof typeof tipos] || tipo
  }

  const totalSaldo = contas.filter(c => c.ativa).reduce((total, conta) => total + conta.saldo, 0)

  return (
    <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Contas Bancárias</h1>
            <p className="text-muted-foreground">Gerencie suas contas bancárias</p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSaldos(!showSaldos)}
            >
              {showSaldos ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {showSaldos ? 'Ocultar Saldos' : 'Mostrar Saldos'}
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Conta
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingConta ? 'Editar Conta Bancária' : 'Nova Conta Bancária'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingConta 
                      ? 'Atualize as informações da conta bancária' 
                      : 'Adicione uma nova conta bancária ao sistema'
                    }
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="nome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome da Conta</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Conta Principal" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="banco"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Banco</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: Banco do Brasil" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="tipo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="corrente">Conta Corrente</SelectItem>
                                <SelectItem value="poupanca">Poupança</SelectItem>
                                <SelectItem value="aplicacao">Aplicação</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="agencia"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Agência</FormLabel>
                            <FormControl>
                              <Input placeholder="1234-5" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="conta"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Conta</FormLabel>
                            <FormControl>
                              <Input placeholder="12345-6" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="saldo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Saldo Inicial</FormLabel>
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
                    <FormField
                      control={form.control}
                      name="ativa"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                          <FormLabel>Conta Ativa</FormLabel>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end gap-2 pt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          setIsDialogOpen(false)
                          setEditingConta(null)
                          form.reset()
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit">
                        {editingConta ? 'Atualizar' : 'Criar Conta'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total de Contas</CardDescription>
              <CardTitle className="text-2xl">{contas.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Contas Ativas</CardDescription>
              <CardTitle className="text-2xl">{contas.filter(c => c.ativa).length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Saldo Total</CardDescription>
              <CardTitle className="text-2xl">
                {showSaldos ? formatCurrency(totalSaldo) : '••••••'}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Lista de Contas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contas.map((conta) => (
            <Card key={conta.id} className="financial-card">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-primary" />
                    <div>
                      <CardTitle className="text-lg">{conta.nome}</CardTitle>
                      <CardDescription>{conta.banco}</CardDescription>
                    </div>
                  </div>
                  <Badge variant={conta.ativa ? "default" : "secondary"}>
                    {conta.ativa ? "Ativa" : "Inativa"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Tipo:</span>
                    <p className="font-medium">{getTipoLabel(conta.tipo)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Agência:</span>
                    <p className="font-medium">{conta.agencia}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Conta:</span>
                    <p className="font-medium">{conta.conta}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Saldo:</span>
                    <p className="font-medium">
                      {showSaldos ? formatCurrency(conta.saldo) : '••••••'}
                    </p>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(conta)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(conta.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {contas.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma conta bancária cadastrada</h3>
              <p className="text-muted-foreground mb-4">
                Comece adicionando sua primeira conta bancária
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Conta
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Importações e Operações */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Upload className="h-6 w-6" />
            Importações e Operações
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Importar Excel */}
            <Card className="financial-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5" />
                  Planilha Excel
                </CardTitle>
                <CardDescription>
                  Importe fornecedores e despesas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert className="mb-4">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Suporte completo a arquivos Excel!
                  </AlertDescription>
                </Alert>
                <Link to="/importacao/excel">
                  <Button className="w-full gradient-primary text-white">
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Importar Excel
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Importar OFX */}
            <Card className="financial-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Extratos OFX
                </CardTitle>
                <CardDescription>
                  Importe movimentações bancárias
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ImportOFXInstructions />
              </CardContent>
            </Card>

            {/* Lançamentos Manuais */}
            <Card className="financial-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Lançamentos Manuais
                </CardTitle>
                <CardDescription>
                  Registre juros, tarifas e taxas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => {
                    // Registrar lançamento de tarifa
                    const valor = parseFloat(prompt('Valor da tarifa:') || '0')
                    const descricao = prompt('Descrição:') || 'Tarifa bancária'
                    if (valor > 0) {
                      financialDataService.criarLancamentoSistema({
                        data: new Date().toISOString().split('T')[0],
                        descricao,
                        valor,
                        tipo: 'debito',
                        categoria: 'Tarifa',
                        origem: 'manual'
                      })
                      toast({
                        title: "Tarifa registrada",
                        description: `${descricao} - R$ ${valor.toFixed(2)}`
                      })
                    }
                  }}
                >
                  Registrar Tarifa
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => {
                    // Registrar lançamento de juros
                    const valor = parseFloat(prompt('Valor dos juros:') || '0')
                    const descricao = prompt('Descrição:') || 'Juros'
                    const tipo = confirm('É juros recebido?') ? 'credito' : 'debito'
                    if (valor > 0) {
                      financialDataService.criarLancamentoSistema({
                        data: new Date().toISOString().split('T')[0],
                        descricao,
                        valor,
                        tipo,
                        categoria: 'Juros',
                        origem: 'manual'
                      })
                      toast({
                        title: "Juros registrado",
                        description: `${descricao} - R$ ${valor.toFixed(2)}`
                      })
                    }
                  }}
                >
                  Registrar Juros
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
    </div>
  )
}

export default ContasBancarias