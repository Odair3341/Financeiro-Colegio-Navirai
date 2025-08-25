import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Building2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { financialDataService } from "@/services/financialData";

const recebimentoSchema = z.object({
  contaBancariaId: z.string().min(1, "Conta bancária é obrigatória"),
  valor: z.number().positive("Valor deve ser maior que zero"),
  dataRecebimento: z.date({
    required_error: "Data do recebimento é obrigatória",
  }),
  descricao: z.string().min(1, "Descrição é obrigatória"),
  numeroDocumento: z.string().optional(),
});

type RecebimentoFormData = z.infer<typeof recebimentoSchema>;

interface ModalRecebimentoProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  despesa?: Despesa; // Dados da despesa específica (opcional)
}

export function ModalRecebimento({ isOpen, onClose, onSuccess, despesa }: ModalRecebimentoProps) {
  const [contasBancarias, setContasBancarias] = useState<ContaBancaria[]>([]);
  const { toast } = useToast();

  const form = useForm<RecebimentoFormData>({
    resolver: zodResolver(recebimentoSchema),
    defaultValues: {
      contaBancariaId: "",
      valor: 0,
      dataRecebimento: new Date(),
      descricao: "",
      numeroDocumento: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      const contas = financialDataService.getContasBancarias();
      setContasBancarias(contas.filter(conta => conta.ativa));
      
      // Reset form when modal opens
      form.reset({
        contaBancariaId: "",
        valor: despesa ? despesa.valor : 0,
        dataRecebimento: new Date(),
        descricao: despesa ? `Recebimento referente a: ${despesa.descricao}` : "",
        numeroDocumento: "",
      });
    }
  }, [isOpen, form, despesa]);

  const onSubmit = async (data: RecebimentoFormData) => {
    try {
      // Criar lançamento de recebimento no sistema
      await financialDataService.criarLancamentoSistema({
        data: format(data.dataRecebimento, 'yyyy-MM-dd'),
        descricao: data.descricao,
        valor: data.valor,
        tipo: 'credito',
        categoria: 'Recebimento',
        origem: 'recebimento',
        numeroDocumento: data.numeroDocumento,
      });

      toast({
        title: "Recebimento registrado!",
        description: `R$ ${data.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} foi registrado com sucesso.`,
      });

      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: "Erro ao registrar recebimento",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    });
  };

  const contaSelecionada = contasBancarias.find(conta => conta.id === form.watch("contaBancariaId"));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Registrar Recebimento
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="contaBancariaId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conta Bancária *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma conta bancária" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {contasBancarias.map((conta) => (
                        <SelectItem key={conta.id} value={conta.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{conta.nome}</span>
                            <span className="text-xs text-muted-foreground">
                              {conta.banco} • Ag: {conta.agencia} • Conta: {conta.conta}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {contaSelecionada && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Building2 className="h-4 w-4" />
                  <span className="font-medium">{contaSelecionada.nome}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Saldo atual: {formatCurrency(contaSelecionada.saldo)}
                </p>
              </div>
            )}

            <FormField
              control={form.control}
              name="valor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor do Recebimento *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="0,00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dataRecebimento"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data do Recebimento *</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "dd/MM/yyyy", { locale: ptBR })
                          ) : (
                            <span>Selecione uma data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date()}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
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
                  <FormLabel>Descrição *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descrição do recebimento..."
                      {...field}
                      rows={3}
                    />
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
                  <FormLabel>Número do Documento (opcional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: DOC123, TED456, etc..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" className="flex-1">
                Registrar Recebimento
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}