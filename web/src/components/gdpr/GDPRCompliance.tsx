import React, { useState } from 'react';
import { SecurityService } from '@/shared/utils/security';

interface GDPRConsentProps {
  onConsentGiven: (consents: GDPRConsents) => void;
  onConsentWithdrawn: () => void;
}

export interface GDPRConsents {
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
  necessary: boolean; // Always true, cannot be disabled
}

export const GDPRConsentBanner: React.FC<GDPRConsentProps> = ({
  onConsentGiven,
  onConsentWithdrawn
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [consents, setConsents] = useState<GDPRConsents>({
    analytics: false,
    marketing: false,
    functional: false,
    necessary: true
  });

  const handleConsentChange = (type: keyof GDPRConsents, value: boolean) => {
    if (type === 'necessary') return; // Necessary cookies cannot be disabled

    setConsents(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const handleAcceptAll = () => {
    const allConsents: GDPRConsents = {
      analytics: true,
      marketing: true,
      functional: true,
      necessary: true
    };
    setConsents(allConsents);
    onConsentGiven(allConsents);
  };

  const handleAcceptSelected = () => {
    onConsentGiven(consents);
  };

  const handleRejectAll = () => {
    const minimalConsents: GDPRConsents = {
      analytics: false,
      marketing: false,
      functional: false,
      necessary: true
    };
    setConsents(minimalConsents);
    onConsentGiven(minimalConsents);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col space-y-4">
          {/* Main consent message */}
          <div className="text-sm text-gray-700">
            <p className="mb-2">
              <strong>Cookies e Privacidade</strong>
            </p>
            <p>
              Utilizamos cookies e tecnologias similares para melhorar sua experiência,
              analisar o tráfego e personalizar conteúdo. Ao continuar navegando,
              você concorda com nossa{' '}
              <a href="/privacy-policy" className="text-blue-600 underline">
                Política de Privacidade
              </a>{' '}
              e{' '}
              <a href="/terms-of-service" className="text-blue-600 underline">
                Termos de Serviço
              </a>.
            </p>
          </div>

          {/* Detailed consent options */}
          {showDetails && (
            <div className="border border-gray-200 rounded p-4 space-y-3">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="necessary"
                  checked={consents.necessary}
                  disabled
                  className="rounded"
                />
                <label htmlFor="necessary" className="text-sm">
                  <strong>Cookies Necessários</strong> - Essenciais para o funcionamento do site
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="analytics"
                  checked={consents.analytics}
                  onChange={(e) => handleConsentChange('analytics', e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="analytics" className="text-sm">
                  <strong>Cookies de Analytics</strong> - Nos ajudam a entender como você usa o site
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="functional"
                  checked={consents.functional}
                  onChange={(e) => handleConsentChange('functional', e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="functional" className="text-sm">
                  <strong>Cookies Funcionais</strong> - Melhoram sua experiência no site
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="marketing"
                  checked={consents.marketing}
                  onChange={(e) => handleConsentChange('marketing', e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="marketing" className="text-sm">
                  <strong>Cookies de Marketing</strong> - Usados para anúncios personalizados
                </label>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <button
              onClick={handleAcceptAll}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Aceitar Todos
            </button>

            <button
              onClick={handleAcceptSelected}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            >
              Aceitar Selecionados
            </button>

            <button
              onClick={handleRejectAll}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
            >
              Rejeitar Todos
            </button>

            <button
              onClick={() => setShowDetails(!showDetails)}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
            >
              {showDetails ? 'Ocultar Opções' : 'Personalizar'}
            </button>
          </div>

          {/* Data rights section */}
          <div className="text-xs text-gray-500 border-t pt-2">
            <p>
              Seus direitos: Você pode solicitar acesso, correção, exclusão ou portabilidade
              dos seus dados pessoais a qualquer momento através do nosso{' '}
              <a href="/contact" className="underline">
                formulário de contato
              </a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

interface DataRightsPanelProps {
  userId: string;
}

export const DataRightsPanel: React.FC<DataRightsPanelProps> = ({ userId }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleDataExport = async () => {
    try {
      setLoading(true);
      const securityService = SecurityService.getInstance();
      const data = await securityService.exportUserData(userId);

      // In a real implementation, this would trigger a download
      console.log('User data export:', data);
      setMessage('Solicitação de exportação de dados enviada. Você receberá um email em breve.');
    } catch (error) {
      setMessage('Erro ao solicitar exportação de dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleDataDeletion = async () => {
    if (!confirm('Tem certeza de que deseja excluir permanentemente todos os seus dados? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      setLoading(true);
      const securityService = SecurityService.getInstance();
      await securityService.deleteUserData(userId);
      setMessage('Solicitação de exclusão de dados enviada. Seus dados serão removidos em até 30 dias.');
    } catch (error) {
      setMessage('Erro ao solicitar exclusão de dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Seus Direitos de Dados (LGPD/GDPR)
      </h3>

      <div className="space-y-4">
        <div className="border border-gray-200 rounded p-4">
          <h4 className="font-medium text-gray-900 mb-2">Direito de Acesso</h4>
          <p className="text-sm text-gray-600 mb-3">
            Solicite uma cópia de todos os dados pessoais que mantemos sobre você.
          </p>
          <button
            onClick={handleDataExport}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Processando...' : 'Solicitar Exportação'}
          </button>
        </div>

        <div className="border border-red-200 rounded p-4">
          <h4 className="font-medium text-red-900 mb-2">Direito ao Esquecimento</h4>
          <p className="text-sm text-red-600 mb-3">
            Solicite a exclusão permanente de todos os seus dados pessoais.
            Esta ação é irreversível.
          </p>
          <button
            onClick={handleDataDeletion}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'Processando...' : 'Solicitar Exclusão'}
          </button>
        </div>

        {message && (
          <div className={`p-3 rounded ${
            message.includes('Erro') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};