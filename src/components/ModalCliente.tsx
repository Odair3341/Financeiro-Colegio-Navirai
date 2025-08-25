import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, User } from "lucide-react";
import { financialDataService } from "@/services/financialData";

interface ModalClienteProps {
  onClienteSalvo?: (cliente: Fornecedor) => void;
}

const ModalCliente = ({ onClienteSalvo }: ModalClienteProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    documento: "",
    tipo: "pf" as "pf" | "pj",
    email: "",
    telefone: "",
    endereco: ""
  });
  const { toast } = useToast();

  const salvarCliente = () => {
    if (!formData.nome.trim()) {
      toast({
        title: "Nome é obrigatório",
        description: "Informe o nome do cliente",
        variant: "destructive"
      });
      return;
    }

    if (!formData.documento.trim()) {
      toast({
        title: "Documento é obrigatório", 
        description: "Informe o CPF/CNPJ do cliente",
        variant: "destructive"
      });
      return;
    }

    try {
      const novoCliente = financialDataService.saveFornecedor({
        nome: formData.nome,
        documento: formData.documento,
        tipo: formData.tipo,
        email: formData.email || undefined,
        telefone: formData.telefone || undefined,
        endereco: formData.endereco || undefined,
        ativo: true
      });

      toast({
        title: "Cliente cadastrado!",
        description: `${formData.nome} foi adicionado com sucesso`
      });

      setIsOpen(false);
      setFormData({
        nome: "",
        documento: "",
        tipo: "pf",
        email: "",
        telefone: "",
        endereco: ""
      });

      onClienteSalvo?.(novoCliente);
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao cadastrar o cliente",
        variant: "destructive"
      });
    }
  };

  const formatarDocumento = (valor: string, tipo: "pf" | "pj") => {
    const digits = valor.replace(/\D/g, '');
    
    if (tipo === 'pf') {
      // CPF: 000.000.000-00
      return digits.replace(/^(\d{3})(\d{3})(\d{3})(\d{2}).*/, '$1.$2.$3-$4');
    } else {
      // CNPJ: 00.000.000/0000-00
      return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2}).*/, '$1.$2.$3/$4-$5');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-3 w-3 mr-1" />
          Novo Cliente
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Cadastrar Cliente
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
              placeholder="cliente@email.com"
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

          <Button 
            onClick={salvarCliente}
            className="w-full gradient-primary text-white"
            disabled={!formData.nome || !formData.documento}
          >
            <Plus className="h-4 w-4 mr-2" />
            Cadastrar Cliente
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModalCliente;