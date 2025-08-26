import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Users, Building, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
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


const fornecedorSchema = z.object({
  nome: z.string().optional(),
  documento: z.string().optional(),
  tipo: z.enum(["pf", "pj"]),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  telefone: z.string().optional(),
  endereco: z.string().optional(),
  ativo: z.boolean()
})

type FornecedorFormData = z.infer<typeof fornecedorSchema>

const Fornecedores = () => {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingFornecedor, setEditingFornecedor] = useState<Fornecedor | null>(null)
  const [filtroTipo, setFiltroTipo] = useState<string>("todos")
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
    const fornecedoresData = financialDataService.getFornecedoresSync()
    setFornecedores(fornecedoresData)
  }

  const onSubmit = (data: FornecedorFormData) => {
    try {
      const formData = {
        ...data,
        nome: data.nome || "Sem nome",
        documento: data.documento || "Sem documento",
        email: data.email || undefined,
        telefone: data.telefone || undefined,
        endereco: data.endereco || undefined
      }

      if (editingFornecedor) {
        financialDataService.updateFornecedor(editingFornecedor.id, formData as Fornecedor)
        toast({
          title: "Fornecedor atualizado",
          description: "O fornecedor foi atualizado com sucesso."
        })
      } else {
        financialDataService.saveFornecedor(formData as Omit<Fornecedor, 'id' | 'createdAt' | 'updatedAt'>)
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
    if (tipo === 'pf') {
      return documento.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    } else {
      return documento.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
    }
  }

  // Função para normalizar texto (remover acentos e converter para minúsculo)
  const normalizeText = (text: string) => {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // remove acentos
      .toLowerCase()
      .trim()
  }

  const fornecedoresFiltrados = Array.isArray(fornecedores) ? fornecedores.filter(fornecedor => {
    const matchTipo = filtroTipo === "todos" || fornecedor.tipo === filtroTipo
    
    if (!buscaFornecedor.trim()) {
      return matchTipo
    }
    
    const termoBusca = normalizeText(buscaFornecedor)
    const matchBusca = 
      normalizeText(fornecedor.nome || "").includes(termoBusca) ||
      fornecedor.documento?.replace(/\D/g, '').includes(buscaFornecedor.replace(/\D/g, '')) ||
      normalizeText(fornecedor.email || "").includes(termoBusca)
    
    return matchTipo && matchBusca
  }) : []

  const fornecedoresAtivos = Array.isArray(fornecedores) ? fornecedores.filter(f => f.ativo).length : 0
  const fornecedoresPJ = Array.isArray(fornecedores) ? fornecedores.filter(f => f.tipo === 'pj').length : 0
  const fornecedoresPF = Array.isArray(fornecedores) ? fornecedores.filter(f => f.tipo === 'pf').length : 0

  return (
    <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Fornecedores</h1>
            <p className="text-muted-foreground">Gerencie seus fornecedores</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo Fornecedor
              </Button>
            </DialogTrigger>
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
                          <FormLabel>Nome / Razão Social</FormLabel>
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
                          <FormLabel>Tipo</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                          {form.watch("tipo") === "pf" ? "CPF" : "CNPJ"}
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder={form.watch("tipo") === "pf" ? "000.000.000-00" : "00.000.000/0000-00"} 
                            {...field} 
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
                            <Input placeholder="(11) 99999-9999" {...field} />
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
                    <Button type="submit">
                      {editingFornecedor ? 'Atualizar' : 'Criar Fornecedor'}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total</CardDescription>
              <CardTitle className="text-2xl">{fornecedores.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Ativos</CardDescription>
              <CardTitle className="text-2xl">{fornecedoresAtivos}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Pessoa Jurídica</CardDescription>
              <CardTitle className="text-2xl">{fornecedoresPJ}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Pessoa Física</CardDescription>
              <CardTitle className="text-2xl">{fornecedoresPF}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Filtros */}
        <div className="flex gap-4">
          <div className="relative flex-1 max-w-sm">
            <Input
              placeholder="Buscar fornecedores por nome, documento ou email..."
              value={buscaFornecedor}
              onChange={(e) => setBuscaFornecedor(e.target.value)}
            />
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
        </div>

        {/* Lista de Fornecedores em Linha */}
        <div className="bg-card rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium">FORNECEDOR</th>
                  <th className="text-left p-4 font-medium">DOCUMENTO</th>
                  <th className="text-left p-4 font-medium">TIPO</th>
                  <th className="text-left p-4 font-medium">CONTATO</th>
                  <th className="text-left p-4 font-medium">STATUS</th>
                  <th className="text-left p-4 font-medium">AÇÕES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {fornecedoresFiltrados.map((fornecedor) => (
                  <tr key={fornecedor.id} className="hover:bg-muted/30">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {fornecedor.tipo === 'pj' ? 
                          <Building className="w-5 h-5 text-primary" /> : 
                          <User className="w-5 h-5 text-primary" />
                        }
                        <div>
                          <p className="font-medium">{fornecedor.nome}</p>
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
                        <p className="font-medium">{formatDocumento(fornecedor.documento, fornecedor.tipo)}</p>
                        <Badge variant="outline" className="text-xs">
                          {fornecedor.tipo === 'pj' ? 'Pessoa Jurídica' : 'Pessoa Física'}
                        </Badge>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant={fornecedor.tipo === 'pj' ? 'default' : 'secondary'}>
                        {fornecedor.tipo === 'pj' ? 'PJ' : 'PF'}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        {fornecedor.email && (
                          <p className="text-sm font-medium truncate max-w-[200px]">{fornecedor.email}</p>
                        )}
                        {fornecedor.telefone && (
                          <p className="text-xs text-muted-foreground">{fornecedor.telefone}</p>
                        )}
                        {!fornecedor.email && !fornecedor.telefone && (
                          <p className="text-xs text-muted-foreground">Não informado</p>
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
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(fornecedor.id)}
                          className="text-destructive hover:text-destructive"
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
        </div>

        {fornecedoresFiltrados.length === 0 && (
          <div className="text-center py-12 bg-card rounded-lg">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum fornecedor encontrado</h3>
            <p className="text-muted-foreground mb-4">
              {filtroTipo === "todos" 
                ? "Comece adicionando seu primeiro fornecedor"
                : "Nenhum fornecedor encontrado com os filtros aplicados"
              }
            </p>
            {filtroTipo === "todos" && (
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Fornecedor
              </Button>
            )}
          </div>
        )}
    </div>
  )
}

export default Fornecedores