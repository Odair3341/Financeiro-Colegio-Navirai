import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tag, Plus, Edit, Trash2, Search, TrendingUp, TrendingDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Categoria {
  id: string;
  nome: string;
  tipo: 'receita' | 'despesa';
  cor: string;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

const Categorias = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<Categoria | null>(null);
  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [formData, setFormData] = useState({
    nome: "",
    tipo: "despesa" as "receita" | "despesa",
    cor: "#3b82f6"
  });
  const { toast } = useToast();

  const cores = [
    "#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6",
    "#ec4899", "#06b6d4", "#84cc16", "#f97316", "#6366f1"
  ];

  useEffect(() => {
    const carregarCategorias = () => {
      // Carregar do localStorage ou criar categorias padrão
      const categoriasSalvas = localStorage.getItem('financeflow_categorias');
      if (categoriasSalvas) {
        setCategorias(JSON.parse(categoriasSalvas));
      } else {
        // Categorias padrão
        const categoriasDefault: Categoria[] = [
          // Receitas
          { id: '1', nome: 'Vendas', tipo: 'receita', cor: '#10b981', ativo: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: '2', nome: 'Prestação de Serviços', tipo: 'receita', cor: '#3b82f6', ativo: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: '3', nome: 'PIX Recebidos', tipo: 'receita', cor: '#06b6d4', ativo: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: '4', nome: 'Mensalidades', tipo: 'receita', cor: '#8b5cf6', ativo: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          
          // Despesas
          { id: '5', nome: 'Fornecedores', tipo: 'despesa', cor: '#ef4444', ativo: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: '6', nome: 'PIX Enviados', tipo: 'despesa', cor: '#f59e0b', ativo: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: '7', nome: 'Pagamentos com Cartão', tipo: 'despesa', cor: '#ec4899', ativo: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: '8', nome: 'Boletos', tipo: 'despesa', cor: '#84cc16', ativo: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: '9', nome: 'Despesas Operacionais', tipo: 'despesa', cor: '#f97316', ativo: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
        ];
        setCategorias(categoriasDefault);
        localStorage.setItem('financeflow_categorias', JSON.stringify(categoriasDefault));
      }
    };
    carregarCategorias();
  }, []);

  const salvarCategoria = () => {
    if (!formData.nome.trim()) {
      toast({
        title: "Nome é obrigatório",
        description: "Informe o nome da categoria",
        variant: "destructive"
      });
      return;
    }

    try {
      let novasCategorias: Categoria[];
      
      if (categoriaSelecionada) {
        // Atualizar categoria existente
        novasCategorias = categorias.map(cat => 
          cat.id === categoriaSelecionada.id 
            ? { ...cat, ...formData, updatedAt: new Date().toISOString() }
            : cat
        );
        toast({
          title: "Categoria atualizada!",
          description: `${formData.nome} foi atualizada com sucesso`
        });
      } else {
        // Criar nova categoria
        const novaCategoria: Categoria = {
          id: Date.now().toString(),
          nome: formData.nome,
          tipo: formData.tipo,
          cor: formData.cor,
          ativo: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        novasCategorias = [...categorias, novaCategoria];
        toast({
          title: "Categoria cadastrada!",
          description: `${formData.nome} foi adicionada com sucesso`
        });
      }

      setCategorias(novasCategorias);
      localStorage.setItem('financeflow_categorias', JSON.stringify(novasCategorias));
      fecharModal();
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar a categoria",
        variant: "destructive"
      });
    }
  };

  const editarCategoria = (categoria: Categoria) => {
    setCategoriaSelecionada(categoria);
    setFormData({
      nome: categoria.nome,
      tipo: categoria.tipo,
      cor: categoria.cor
    });
    setIsModalOpen(true);
  };

  const excluirCategoria = (id: string) => {
    try {
      const novasCategorias = categorias.filter(cat => cat.id !== id);
      setCategorias(novasCategorias);
      localStorage.setItem('financeflow_categorias', JSON.stringify(novasCategorias));
      toast({
        title: "Categoria excluída!",
        description: "A categoria foi removida com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Ocorreu um erro ao excluir a categoria",
        variant: "destructive"
      });
    }
  };

  const fecharModal = () => {
    setIsModalOpen(false);
    setCategoriaSelecionada(null);
    setFormData({
      nome: "",
      tipo: "despesa",
      cor: "#3b82f6"
    });
  };

  const categoriasFiltradas = categorias.filter(categoria => {
    const matchBusca = !busca || categoria.nome.toLowerCase().includes(busca.toLowerCase());
    const matchTipo = filtroTipo === "todos" || categoria.tipo === filtroTipo;
    return matchBusca && matchTipo;
  });

  const receitas = categoriasFiltradas.filter(cat => cat.tipo === 'receita');
  const despesas = categoriasFiltradas.filter(cat => cat.tipo === 'despesa');

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Tag className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Categorias</h1>
            <p className="text-muted-foreground">Gerencie as categorias de receitas e despesas</p>
          </div>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-white">
              <Plus className="h-4 w-4 mr-2" />
              Nova Categoria
            </Button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                {categoriaSelecionada ? 'Editar Categoria' : 'Cadastrar Categoria'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Nome */}
              <div className="space-y-2">
                <Label>Nome da Categoria *</Label>
                <Input
                  value={formData.nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                  placeholder="Ex: Materiais de Escritório"
                />
              </div>

              {/* Tipo */}
              <div className="space-y-2">
                <Label>Tipo *</Label>
                <Select 
                  value={formData.tipo} 
                  onValueChange={(value: "receita" | "despesa") => setFormData(prev => ({ ...prev, tipo: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="receita">Receita</SelectItem>
                    <SelectItem value="despesa">Despesa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Cor */}
              <div className="space-y-2">
                <Label>Cor</Label>
                <div className="flex gap-2 flex-wrap">
                  {cores.map(cor => (
                    <button
                      key={cor}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 ${
                        formData.cor === cor ? 'border-ring' : 'border-border'
                      }`}
                      style={{ backgroundColor: cor }}
                      onClick={() => setFormData(prev => ({ ...prev, cor }))}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={salvarCategoria}
                  className="flex-1 gradient-primary text-white"
                  disabled={!formData.nome}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {categoriaSelecionada ? 'Atualizar' : 'Cadastrar'} Categoria
                </Button>
                <Button variant="outline" onClick={fecharModal}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-6 p-4 bg-card rounded-lg">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar categorias..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-64"
          />
        </div>
        
        <Select value={filtroTipo} onValueChange={setFiltroTipo}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os tipos</SelectItem>
            <SelectItem value="receita">Receitas</SelectItem>
            <SelectItem value="despesa">Despesas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista de Categorias */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Receitas */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <h2 className="text-lg font-semibold">Receitas ({receitas.length})</h2>
          </div>
          <div className="space-y-3">
            {receitas.map((categoria) => (
              <div key={categoria.id} className="financial-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: categoria.cor }}
                    />
                    <span className="font-medium">{categoria.nome}</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Receita
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => editarCategoria(categoria)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => excluirCategoria(categoria.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {receitas.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                Nenhuma categoria de receita encontrada
              </div>
            )}
          </div>
        </div>

        {/* Despesas */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="h-5 w-5 text-red-600" />
            <h2 className="text-lg font-semibold">Despesas ({despesas.length})</h2>
          </div>
          <div className="space-y-3">
            {despesas.map((categoria) => (
              <div key={categoria.id} className="financial-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: categoria.cor }}
                    />
                    <span className="font-medium">{categoria.nome}</span>
                    <Badge variant="secondary" className="bg-red-100 text-red-800">
                      Despesa
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => editarCategoria(categoria)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => excluirCategoria(categoria.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {despesas.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                Nenhuma categoria de despesa encontrada
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categorias;