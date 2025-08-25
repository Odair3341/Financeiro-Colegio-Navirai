import { useState, useEffect, useMemo } from "react"
import { Plus, Edit, Trash2, Building, User, Search, X, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Fornecedor, financialDataService } from "@/services/financialData"
import { searchSuppliers } from "@/lib/text"

const fornecedorSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  documento: z.string().min(1, "Documento é obrigatório"),
  tipo: z.enum(["pf", "pj"]),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  telefone: z.string().optional(),
  endereco: z.string().optional(),
  ativo: z.boolean()
})

type FornecedorFormData = z.infer<typeof fornecedorSchema>

const FornecedoresImproved = () => {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingFornecedor, setEditingFornecedor] = useState<Fornecedor | null>(null)
  const [filtroTipo, setFiltroTipo] = useState<string>("todos")
  const [filtroStatus, setFiltroStatus] = useState<string>("todos")
  const [buscaFornecedor, setBuscaFornecedor] = useState("")

  const form = useForm<FornecedorFormData>({
    resolver: zodResolver(fornecedorSchema),
    defaultValues: {
      nome: "",
      documento: "",
      tipo: "pj",
      email: "",
      telefone: "",
      endereco: "",
      ativo: true
    }
  })

  useEffect(() => {
    loadFornecedores()
  }, [])

  const loadFornecedores = () => {
    const fornecedoresData = financialDataService.getFornecedores()
    setFornecedores(fornecedoresData)
  }

  const onSubmit = (data: FornecedorFormData) => {
    try {
      if (editingFornecedor) {
        financialDataService.updateFornecedor(editingFornecedor.id, data as Partial<Fornecedor>)
        toast({
          title: "Fornecedor atualizado",
          description: "O fornecedor foi atualizado com sucesso."
        })
      } else {
        const fornecedorData = {
          nome: data.nome!,
          documento: data.documento!,
          tipo: data.tipo,
          email: data.email || undefined,
          telefone: data.telefone || undefined,
          endereco: data.endereco || undefined,
          ativo: data.ativo
        }
        financialDataService.saveFornecedor(fornecedorData)
        toast({
          title: "Fornecedor criado",
          description: "O fornecedor foi criado com sucesso."
        })
      }
      
      loadFornecedores()
      setIsDialogOpen(false)
      setEditingFornecedor(null)
      form.reset()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o fornecedor.",
        variant: "destructive"
      })
    }
  }

  const handleEdit = (fornecedor: Fornecedor) => {
    setEditingFornecedor(fornecedor)
    form.reset({
      nome: fornecedor.nome,
      documento: fornecedor.documento,
      tipo: fornecedor.tipo,
      email: fornecedor.email || "",
      telefone: fornecedor.telefone || "",
      endereco: fornecedor.endereco || "",
      ativo: fornecedor.ativo
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este fornecedor?")) {
      try {
        financialDataService.deleteFornecedor(id)
        loadFornecedores()
        toast({
          title: "Fornecedor excluído",
          description: "O fornecedor foi excluído com sucesso."
        })
      } catch (error) {
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao excluir o fornecedor.",
          variant: "destructive"
        })
      }
    }
  }

  const formatDocumento = (documento: string, tipo: string) => {
    const digits = documento.replace(/\D/g, '')
    if (tipo === 'pf') {
      return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    } else {
      return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
    }
  }

  // Busca inteligente e filtros
  const fornecedoresFiltrados = useMemo(() => {
    // Aplicar filtros de tipo e status primeiro
    let filtered = fornecedores.filter(fornecedor => {
      const matchTipo = filtroTipo === "todos" || fornecedor.tipo === filtroTipo
      const matchStatus = filtroStatus === "todos" || 
        (filtroStatus === "ativo" && fornecedor.ativo) ||
        (filtroStatus === "inativo" && !fornecedor.ativo)
      
      return matchTipo && matchStatus
    })

    // Aplicar busca inteligente com normalização de texto
    if (buscaFornecedor.trim()) {
      filtered = searchSuppliers(filtered, buscaFornecedor)
    }

    return filtered
  }, [fornecedores, filtroTipo, filtroStatus, buscaFornecedor])

  const limparFiltros = () => {
    setBuscaFornecedor("")
    setFiltroTipo("todos")
    setFiltroStatus("todos")
  }

  const handleDocumentoChange = (value: string, tipo: string) => {
    const digits = value.replace(/\D/g, '')
    let formatted = digits
    
    if (tipo === 'pf' && digits.length <= 11) {
      formatted = digits.replace(/^(\d{3})(\d{3})(\d{3})(\d{2}).*/, '$1.$2.$3-$4')
    } else if (tipo === 'pj' && digits.length <= 14) {
      formatted = digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2}).*/, '$1.$2.$3/$4-$5')
    }
    
    return formatted
  }

  const formatTelefone = (value: string) => {
    const digits = value.replace(/\D/g, '')
    return digits.replace(/^(\d{2})(\d{4,5})(\d{4}).*/, '($1) $2-$3')
  }

  // Estatísticas
  const stats = useMemo(() => {
    const total = fornecedores.length
    const ativos = fornecedores.filter(f => f.ativo).length
    const pj = fornecedores.filter(f => f.tipo === 'pj').length
    const pf = fornecedores.filter(f => f.tipo === 'pf').length
    return { total, ativos, pj, pf }
  }, [fornecedores])

  const temFiltrosAtivos = buscaFornecedor || filtroTipo !== "todos" || filtroStatus !== "todos"

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Fornecedores</h1>
          <p className="text-muted-foreground">
            Gerencie seus fornecedores de forma inteligente
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <Button onClick={() => setIsDialogOpen(true)} className="gradient-primary text-white">
            <Plus className="w-4 h-4 mr-2" />
            Novo Fornecedor
          </Button>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingFornecedor ? 'Editar Fornecedor' : 'Novo Fornecedor'}
              </DialogTitle>
              <DialogDescription>
                {editingFornecedor 
                  ? 'Atualize as informações do fornecedor' 
                  : 'Adicione um novo fornecedor ao sistema'
                }
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="nome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome / Razão Social *</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome do fornecedor" {...field} />
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
                        <FormLabel>Tipo *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pf">Pessoa Física</SelectItem>
                            <SelectItem value="pj">Pessoa Jurídica</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="documento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {form.watch("tipo") === "pf" ? "CPF *" : "CNPJ *"}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={form.watch("tipo") === "pf" ? "000.000.000-00" : "00.000.000/0000-00"}
                          {...field}
                          onChange={(e) => {
                            const formatted = handleDocumentoChange(e.target.value, form.watch("tipo"))
                            field.onChange(formatted)
                          }}
                          maxLength={form.watch("tipo") === "pf" ? 14 : 18}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-mail</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="email@exemplo.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="telefone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="(11) 99999-9999" 
                            {...field}
                            onChange={(e) => {
                              const formatted = formatTelefone(e.target.value)
                              field.onChange(formatted)
                            }}
                            maxLength={15}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="endereco"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Endereço</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Endereço completo do fornecedor" 
                          {...field} 
                          rows={2}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="ativo"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <FormLabel>Fornecedor Ativo</FormLabel>
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
                      setEditingFornecedor(null)
                      form.reset()
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" className="gradient-primary text-white">
                    {editingFornecedor ? 'Atualizar' : 'Criar Fornecedor'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total de Fornecedores</CardDescription>
            <CardTitle className="text-3xl font-bold text-primary">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Fornecedores Ativos</CardDescription>
            <CardTitle className="text-3xl font-bold text-green-600">{stats.ativos}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Pessoa Jurídica</CardDescription>
            <CardTitle className="text-3xl font-bold text-blue-600">{stats.pj}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Pessoa Física</CardDescription>
            <CardTitle className="text-3xl font-bold text-purple-600">{stats.pf}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filtros e Busca */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Busca Inteligente
          </CardTitle>
          <CardDescription>
            Pesquise por nome, documento, email ou telefone
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Digite qualquer informação do fornecedor..."
              value={buscaFornecedor}
              onChange={(e) => setBuscaFornecedor(e.target.value)}
              className="pl-10"
            />
            {buscaFornecedor && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-2 h-6 w-6 p-0"
                onClick={() => setBuscaFornecedor("")}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
          
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filtros:</span>
            </div>
            
            <Select value={filtroTipo} onValueChange={setFiltroTipo}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os tipos</SelectItem>
                <SelectItem value="pf">Pessoa Física</SelectItem>
                <SelectItem value="pj">Pessoa Jurídica</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filtroStatus} onValueChange={setFiltroStatus}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                <SelectItem value="ativo">Apenas ativos</SelectItem>
                <SelectItem value="inativo">Apenas inativos</SelectItem>
              </SelectContent>
            </Select>
            
            {temFiltrosAtivos && (
              <Button
                variant="outline"
                size="sm"
                onClick={limparFiltros}
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Limpar
              </Button>
            )}
          </div>
          
          <div className="text-sm text-muted-foreground">
            {fornecedoresFiltrados.length === fornecedores.length ? (
              `Exibindo todos os ${fornecedores.length} fornecedores`
            ) : (
              `Encontrados ${fornecedoresFiltrados.length} de ${fornecedores.length} fornecedores`
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lista de Fornecedores */}
      <div className="bg-card rounded-lg overflow-hidden border">
        {fornecedoresFiltrados.length === 0 ? (
          <div className="p-8 text-center">
            <div className="mb-4">
              <User className="w-12 h-12 text-muted-foreground mx-auto" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {buscaFornecedor || temFiltrosAtivos 
                ? "Nenhum fornecedor encontrado" 
                : "Nenhum fornecedor cadastrado"
              }
            </h3>
            <p className="text-muted-foreground mb-4">
              {buscaFornecedor || temFiltrosAtivos
                ? "Tente ajustar os filtros ou a busca"
                : "Comece cadastrando seu primeiro fornecedor"
              }
            </p>
            {!buscaFornecedor && !temFiltrosAtivos && (
              <Button onClick={() => setIsDialogOpen(true)} className="gradient-primary text-white">
                <Plus className="w-4 h-4 mr-2" />
                Cadastrar Primeiro Fornecedor
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium">FORNECEDOR</th>
                  <th className="text-left p-4 font-medium">DOCUMENTO</th>
                  <th className="text-left p-4 font-medium">CONTATO</th>
                  <th className="text-left p-4 font-medium">STATUS</th>
                  <th className="text-left p-4 font-medium">AÇÕES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {fornecedoresFiltrados.map((fornecedor) => (
                  <tr key={fornecedor.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {fornecedor.tipo === 'pj' ? 
                          <Building className="w-5 h-5 text-primary flex-shrink-0" /> : 
                          <User className="w-5 h-5 text-primary flex-shrink-0" />
                        }
                        <div className="min-w-0">
                          <p className="font-medium truncate">{fornecedor.nome}</p>
                          {fornecedor.endereco && (
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {fornecedor.endereco}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-mono text-sm">{formatDocumento(fornecedor.documento, fornecedor.tipo)}</p>
                        <Badge variant="outline" className="text-xs mt-1">
                          {fornecedor.tipo === 'pj' ? 'Pessoa Jurídica' : 'Pessoa Física'}
                        </Badge>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1 min-w-0">
                        {fornecedor.email && (
                          <p className="text-sm font-medium truncate">{fornecedor.email}</p>
                        )}
                        {fornecedor.telefone && (
                          <p className="text-xs text-muted-foreground">{fornecedor.telefone}</p>
                        )}
                        {!fornecedor.email && !fornecedor.telefone && (
                          <p className="text-xs text-muted-foreground italic">Não informado</p>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant={fornecedor.ativo ? "default" : "secondary"}>
                        {fornecedor.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(fornecedor)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(fornecedor.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default FornecedoresImproved