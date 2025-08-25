import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ImportacaoExcel from "./pages/ImportacaoExcel";
import ImportacaoOFX from "./pages/ImportacaoOFX";
import Conciliacao from "./pages/Conciliacao";
import Recebimentos from "./pages/Recebimentos";
import ContasBancarias from "./pages/ContasBancarias";
import FornecedoresImproved from "./pages/FornecedoresImproved";
import Despesas from "./pages/Despesas";
import Empresas from "./pages/Empresas";
import Categorias from "./pages/Categorias";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Index />} />
            <Route path="dashboard" element={<Index />} />
            <Route path="contas-bancarias" element={<ContasBancarias />} />
            <Route path="fornecedores" element={<FornecedoresImproved />} />
            <Route path="despesas" element={<Despesas />} />
            <Route path="recebimentos" element={<Recebimentos />} />
            <Route path="conciliacao" element={<Conciliacao />} />
            <Route path="empresas" element={<Empresas />} />
            <Route path="categorias" element={<Categorias />} />
            <Route path="importacao/excel" element={<ImportacaoExcel />} />
            <Route path="importacao/ofx" element={<ImportacaoOFX />} />
            <Route path="importacao-ofx" element={<ImportacaoOFX />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
