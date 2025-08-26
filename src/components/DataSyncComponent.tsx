import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { DataSync } from '@/lib/dataSync';
import { Copy, Download, Upload, Share, Trash2, Smartphone } from 'lucide-react';

const DataSyncComponent: React.FC = () => {
  const [importCode, setImportCode] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [showShare, setShowShare] = useState(false);

  const handleGenerateShare = () => {
    try {
      const url = DataSync.generateShareUrl();
      setShareUrl(url);
      setShowShare(true);
      
      toast({
        title: \"📱 Link gerado!\",
        description: \"Copie o link para sincronizar com outros dispositivos\"
      });
    } catch (error) {
      toast({
        title: \"❌ Erro\",
        description: \"Não foi possível gerar o link\",
        variant: \"destructive\"
      });
    }
  };

  const handleCopyShare = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: \"✅ Copiado!\",
        description: \"Link copiado para a área de transferência\"
      });
    } catch (error) {
      toast({
        title: \"⚠️ Aviso\",
        description: \"Copie o link manualmente\"
      });
    }
  };

  const handleImport = () => {
    if (!importCode.trim()) {
      toast({
        title: \"⚠️ Campo vazio\",
        description: \"Digite o código de importação\"
      });
      return;
    }

    const success = DataSync.importFromCode(importCode.trim());
    if (!success) {
      toast({
        title: \"❌ Erro\",
        description: \"Código inválido ou importação cancelada\",
        variant: \"destructive\"
      });
    }
  };

  const handleDownloadBackup = () => {
    try {
      DataSync.downloadBackup();
      toast({
        title: \"💾 Backup criado!\",
        description: \"Arquivo de backup baixado\"
      });
    } catch (error) {
      toast({
        title: \"❌ Erro\",
        description: \"Não foi possível criar o backup\",
        variant: \"destructive\"
      });
    }
  };

  const handleReset = () => {
    DataSync.resetData();
  };

  return (
    <div className=\"space-y-6\">
      {/* Sincronização entre Dispositivos */}
      <Card>
        <CardHeader>
          <CardTitle className=\"flex items-center gap-2\">
            <Smartphone className=\"h-5 w-5\" />
            Sincronizar entre Dispositivos
          </CardTitle>
        </CardHeader>
        <CardContent className=\"space-y-4\">
          {/* Gerar Link de Compartilhamento */}
          <div className=\"space-y-2\">
            <div className=\"flex gap-2\">
              <Button onClick={handleGenerateShare} className=\"flex items-center gap-2\">
                <Share className=\"h-4 w-4\" />
                Gerar Link de Sincronização
              </Button>
            </div>
            
            {showShare && (
              <div className=\"space-y-2\">
                <Input 
                  value={shareUrl}
                  readOnly
                  className=\"bg-muted\"
                />
                <Button onClick={handleCopyShare} variant=\"outline\" size=\"sm\">
                  <Copy className=\"h-4 w-4 mr-2\" />
                  Copiar Link
                </Button>
                <p className=\"text-xs text-muted-foreground\">
                  📱 Abra este link em outro dispositivo para sincronizar os dados
                </p>
              </div>
            )}
          </div>

          {/* Importar de Código */}
          <div className=\"space-y-2\">
            <label className=\"text-sm font-medium\">Ou cole um código de sincronização:</label>
            <div className=\"flex gap-2\">
              <Input 
                placeholder=\"Cole o código aqui...\"
                value={importCode}
                onChange={(e) => setImportCode(e.target.value)}
              />
              <Button onClick={handleImport} variant=\"outline\">
                <Upload className=\"h-4 w-4 mr-2\" />
                Importar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Backup e Restauração */}
      <Card>
        <CardHeader>
          <CardTitle className=\"flex items-center gap-2\">
            <Download className=\"h-5 w-5\" />
            Backup dos Dados
          </CardTitle>
        </CardHeader>
        <CardContent className=\"space-y-4\">
          <div className=\"flex gap-2\">
            <Button onClick={handleDownloadBackup} variant=\"outline\">
              <Download className=\"h-4 w-4 mr-2\" />
              Baixar Backup
            </Button>
            
            <Button onClick={handleReset} variant=\"destructive\">
              <Trash2 className=\"h-4 w-4 mr-2\" />
              Limpar Dados
            </Button>
          </div>
          
          <p className=\"text-xs text-muted-foreground\">
            💾 O backup salva todos os seus dados em um arquivo JSON que pode ser restaurado depois
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataSyncComponent;", "original_text": "", "replace_all": false}]