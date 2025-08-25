import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, Upload, ArrowRight, Info } from "lucide-react";
import { Link } from "react-router-dom";

const ImportOFXInstructions = () => {
  return (
    <div className="space-y-6">
      <Alert className="border-blue-200 bg-blue-50">
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Para importar extratos OFX:</strong> Vá para a página de "Importação OFX" no menu principal.
        </AlertDescription>
      </Alert>

      <Card className="financial-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Como obter arquivo OFX do seu banco
          </CardTitle>
          <CardDescription>
            Siga estes passos para baixar o extrato no formato OFX
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-primary">Banco do Brasil</h4>
              <ol className="text-sm space-y-1 text-muted-foreground">
                <li>1. Acesse o Internet Banking</li>
                <li>2. Vá em "Extrato" → "Conta Corrente"</li>
                <li>3. Escolha o período desejado</li>
                <li>4. Clique em "Outros Formatos"</li>
                <li>5. Selecione "OFX" e baixe</li>
              </ol>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-primary">Itaú</h4>
              <ol className="text-sm space-y-1 text-muted-foreground">
                <li>1. Entre no Itaú Internet Banking</li>
                <li>2. Acesse "Minha Conta" → "Extrato"</li>
                <li>3. Defina o período</li>
                <li>4. Em "Formato", escolha "OFX"</li>
                <li>5. Clique em "Visualizar/Download"</li>
              </ol>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-primary">Santander</h4>
              <ol className="text-sm space-y-1 text-muted-foreground">
                <li>1. Faça login no internet banking</li>
                <li>2. Vá em "Contas" → "Extrato"</li>
                <li>3. Selecione o período</li>
                <li>4. Escolha formato "OFX"</li>
                <li>5. Faça o download</li>
              </ol>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-primary">Caixa Econômica</h4>
              <ol className="text-sm space-y-1 text-muted-foreground">
                <li>1. Acesse o Caixa Fácil</li>
                <li>2. Menu "Conta Corrente" → "Extrato"</li>
                <li>3. Informe o período</li>
                <li>4. Selecione "Arquivo OFX"</li>
                <li>5. Baixe o arquivo</li>
              </ol>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Pronto para importar?</h4>
                <p className="text-sm text-muted-foreground">
                  Após baixar o arquivo OFX, use a página de importação
                </p>
              </div>
              <Link to="/importacao-ofx">
                <Button className="gradient-primary text-white">
                  <Upload className="h-4 w-4 mr-2" />
                  Importar OFX
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImportOFXInstructions;