import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Building2, Plus, Edit, Trash2, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Empresa, financialDataService } from "@/services/financialData";

const Empresas = () => {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [empresaSelecionada, setEmpresaSelecionada] = useState<Empresa | null>(null);
  const [busca, setBusca] = useState("");
  const [formData, setFormData] = useState({
    nome: "",
    documento: "",
    tipo: "pj" as "pf" | "pj",
    email: "",
    telefone: "",
    endereco: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    carregarEmpresas();
  }, []);

  const carregarEmpresas = () => {
    const empresasData = financialDataService.getEmpresas();
    setEmpresas(empresasData);
  };

  const salvarEmpresa = () => {
    if (!formData.nome.trim()) {
      toast({
        title: "Nome é obrigatório",
        description: "Informe o nome da empresa",
        variant: "destructive"
      });
      return;
    }

    if (!formData.documento.trim()) {
      toast({
        title: "Documento é obrigatório", 
        description: "Informe o CPF/CNPJ da empresa",
        variant: "destructive"
      });
      return;
    }

    try {
      if (empresaSelecionada) {
        // Atualizar empresa existente
        financialDataService.updateEmpresa(empresaSelecionada.id, {
          nome: formData.nome,
          documento: formData.documento,
          tipo: formData.tipo,
          email: formData.email || undefined,
          telefone: formData.telefone || undefined,
          endereco: formData.endereco || undefined
        });
        toast({
          title: "Empresa atualizada!",
          description: `${formData.nome} foi atualizada com sucesso`
        });
      } else {
        // Criar nova empresa
        financialDataService.saveEmpresa({
          nome: formData.nome,
          documento: formData.documento,
          tipo: formData.tipo,
          email: formData.email || undefined,
          telefone: formData.telefone || undefined,
          endereco: formData.endereco || undefined,
          ativo: true
        });
        toast({
          title: "Empresa cadastrada!",
          description: `${formData.nome} foi adicionada com sucesso`
        });
      }

      fecharModal();
      carregarEmpresas();
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar a empresa",
        variant: "destructive"
      });
    }
  };

  const editarEmpresa = (empresa: Empresa) => {
    setEmpresaSelecionada(empresa);
    setFormData({
      nome: empresa.nome,
      documento: empresa.documento,
      tipo: empresa.tipo,
      email: empresa.email || "",
      telefone: empresa.telefone || "",
      endereco: empresa.endereco || ""
    });
    setIsModalOpen(true);
  };

  const excluirEmpresa = (id: string) => {
    try {
      financialDataService.deleteEmpresa(id);
      toast({
        title: "Empresa excluída!",
        description: "A empresa foi removida com sucesso"
      });
      carregarEmpresas();
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Ocorreu um erro ao excluir a empresa",
        variant: "destructive"
      });
    }
  };

  const fecharModal = () => {
    setIsModalOpen(false);
    setEmpresaSelecionada(null);
    setFormData({
      nome: "",
      documento: "",
      tipo: "pj",
      email: "",
      telefone: "",
      endereco: ""
    });
  };

  const formatarDocumento = (valor: string, tipo: "pf" | "pj") => {
    const digits = valor.replace(/\D/g, '');
    
    if (tipo === 'pf') {
      return digits.replace(/^(\d{3})(\d{3})(\d{3})(\d{2}).*/, '$1.$2.$3-$4');
    } else {
      return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2}).*/, '$1.$2.$3/$4-$5');
    }
  };

  const empresasFiltradas = empresas.filter(empresa => 
    !busca || 
    empresa.nome.toLowerCase().includes(busca.toLowerCase()) ||
    empresa.documento.includes(busca)
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Building2 className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Empresas</h1>
            <p className="text-muted-foreground">Gerencie as empresas do sistema</p>
          </div>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-white">
              <Plus className="h-4 w-4 mr-2" />
              Nova Empresa
            </Button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {empresaSelecionada ? 'Editar Empresa' : 'Cadastrar Empresa'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Tipo */}
              <div className="space-y-2">
                <Label>Tipo *</Label>
                <Select 
                  value={formData.tipo} 
                  onValueChange={(value: "pf" | "pj") => setFormData(prev => ({ ...prev, tipo: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pf">Pessoa Física</SelectItem>
                    <SelectItem value="pj">Pessoa Jurídica</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Nome */}
              <div className="space-y-2">
                <Label>Nome Completo *</Label>
                <Input
                  value={formData.nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                  placeholder={formData.tipo === 'pf' ? "Nome completo" : "Razão social"}
                />
              </div>

              {/* Documento */}
              <div className="space-y-2">
                <Label>{formData.tipo === 'pf' ? 'CPF' : 'CNPJ'} *</Label>
                <Input
                  value={formatarDocumento(formData.documento, formData.tipo)}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '');
                    setFormData(prev => ({ ...prev, documento: digits }));
                  }}
                  placeholder={formData.tipo === 'pf' ? '000.000.000-00' : '00.000.000/0000-00'}
                  maxLength={formData.tipo === 'pf' ? 14 : 18}
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="empresa@email.com"
                />
              </div>

              {/* Telefone */}
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input
                  value={formData.telefone}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '');
                    const formatted = digits.replace(/^(\d{2})(\d{4,5})(\d{4}).*/, '($1) $2-$3');
                    setFormData(prev => ({ ...prev, telefone: formatted }));
                  }}
                  placeholder="(11) 99999-9999"
                  maxLength={15}
                />
              </div>

              {/* Endereço */}
              <div className="space-y-2">
                <Label>Endereço</Label>
                <Textarea
                  value={formData.endereco}
                  onChange={(e) => setFormData(prev => ({ ...prev, endereco: e.target.value }))}
                  placeholder="Endereço completo..."
                  rows={2}
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={salvarEmpresa}
                  className="flex-1 gradient-primary text-white"
                  disabled={!formData.nome || !formData.documento}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {empresaSelecionada ? 'Atualizar' : 'Cadastrar'} Empresa
                </Button>
                <Button variant="outline" onClick={fecharModal}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Busca */}
      <div className="flex items-center gap-2 mb-6">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar empresas..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Lista de Empresas */}
      <div className="grid gap-4">
        {empresasFiltradas.map((empresa) => (
          <div key={empresa.id} className="financial-card">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-lg">{empresa.nome}</h3>
                  <Badge variant={empresa.tipo === 'pj' ? 'default' : 'secondary'}>
                    {empresa.tipo === 'pj' ? 'Pessoa Jurídica' : 'Pessoa Física'}
                  </Badge>
                  <Badge variant={empresa.ativo ? 'default' : 'destructive'}>
                    {empresa.ativo ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p><strong>Documento:</strong> {formatarDocumento(empresa.documento, empresa.tipo)}</p>
                  {empresa.email && <p><strong>E-mail:</strong> {empresa.email}</p>}
                  {empresa.telefone && <p><strong>Telefone:</strong> {empresa.telefone}</p>}
                  {empresa.endereco && <p><strong>Endereço:</strong> {empresa.endereco}</p>}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editarEmpresa(empresa)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => excluirEmpresa(empresa.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
        
        {empresasFiltradas.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            {busca ? "Nenhuma empresa encontrada" : "Nenhuma empresa cadastrada"}
          </div>
        )}
      </div>
    </div>
  );
};

export default Empresas;