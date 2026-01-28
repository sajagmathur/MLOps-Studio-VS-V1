import React, { useState } from 'react';
import { Plus, Check, X, ExternalLink } from 'lucide-react';

const Integrations: React.FC = () => {
  const [integrations, setIntegrations] = useState([
    {
      id: '1',
      provider: 'GitHub',
      status: 'connected',
      repos: ['ml-models', 'data-pipelines', 'feature-store'],
      lastSync: '2 minutes ago',
      icon: '🐙',
    },
    {
      id: '2',
      provider: 'MLflow',
      status: 'connected',
      uri: 'https://mlflow.mlops.internal',
      registries: 3,
      lastSync: '5 minutes ago',
      icon: '📊',
    },
    {
      id: '3',
      provider: 'AWS',
      status: 'connected',
      region: 'us-east-1',
      services: ['ECR', 'ECS', 'S3', 'RDS'],
      lastSync: '1 minute ago',
      icon: '☁️',
    },
  ]);

  const [showConnectModal, setShowConnectModal] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Integrations</h1>
        <button
          onClick={() => setShowConnectModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition"
        >
          <Plus className="w-4 h-4" />
          Add Integration
        </button>
      </div>

      {/* Connected Integrations */}
      <div className="space-y-4">
        {integrations.map((integration) => (
          <div key={integration.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="text-3xl">{integration.icon}</div>
                <div>
                  <h3 className="text-lg font-semibold">{integration.provider}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <p className="text-sm text-gray-400">{integration.status}</p>
                  </div>
                </div>
              </div>
              <button className="text-xs text-blue-400 hover:text-blue-300">Configure</button>
            </div>

            {integration.provider === 'GitHub' && (
              <div>
                <p className="text-xs text-gray-400 mb-2">Connected Repositories:</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {(integration.repos || []).map((repo) => (
                    <span key={repo} className="px-3 py-1 bg-gray-700 rounded-full text-xs">
                      {repo}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {integration.provider === 'MLflow' && (
              <div>
                <p className="text-xs text-gray-400 mb-2">MLflow Instance:</p>
                <a href={integration.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm mb-3">
                  {integration.uri}
                  <ExternalLink className="w-3 h-3" />
                </a>
                <p className="text-xs text-gray-400">Model Registries: {integration.registries}</p>
              </div>
            )}

            {integration.provider === 'AWS' && (
              <div>
                <p className="text-xs text-gray-400 mb-2">Region: {integration.region}</p>
                <div className="flex flex-wrap gap-2">
                  {(integration.services || []).map((service) => (
                    <span key={service} className="px-3 py-1 bg-blue-600/20 border border-blue-500 rounded text-xs">
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-gray-700 flex items-center justify-between text-xs text-gray-400">
              <span>Last sync: {integration.lastSync}</span>
              <button className="text-blue-400 hover:text-blue-300">Sync Now</button>
            </div>
          </div>
        ))}
      </div>

      {/* OAuth Setup Instructions */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold mb-4">Integration Setup Guide</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-sm mb-2">🐙 GitHub Setup</h4>
            <ol className="list-decimal list-inside text-sm text-gray-400 space-y-1 ml-4">
              <li>Go to GitHub Settings → Developer settings → OAuth Apps</li>
              <li>Create new OAuth App with authorization callback URL</li>
              <li>Copy Client ID and Client Secret</li>
              <li>Paste credentials in MLOps Studio integration settings</li>
              <li>Authorize the app to access repositories</li>
            </ol>
          </div>

          <div>
            <h4 className="font-medium text-sm mb-2">☁️ AWS Setup</h4>
            <ol className="list-decimal list-inside text-sm text-gray-400 space-y-1 ml-4">
              <li>Create IAM role with permissions for ECR, ECS, S3, RDS</li>
              <li>Configure OIDC trust relationship with GitHub</li>
              <li>Ensure environment variables are set in GitHub Secrets</li>
              <li>Test connection with AWS STS assume-role</li>
            </ol>
          </div>

          <div>
            <h4 className="font-medium text-sm mb-2">📊 MLflow Setup</h4>
            <ol className="list-decimal list-inside text-sm text-gray-400 space-y-1 ml-4">
              <li>Deploy MLflow tracking server on ECS</li>
              <li>Configure S3 backend for artifact storage</li>
              <li>Set RDS Postgres as metadata backend</li>
              <li>Generate API token for authentication</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Connect Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-8 w-full max-w-md border border-gray-700">
            <h2 className="text-2xl font-bold mb-6">Add Integration</h2>

            <div className="space-y-3">
              <button className="w-full p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition text-left flex items-center gap-3">
                <span className="text-xl">🐙</span>
                <span>GitHub</span>
              </button>
              <button className="w-full p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition text-left flex items-center gap-3">
                <span className="text-xl">☁️</span>
                <span>AWS</span>
              </button>
              <button className="w-full p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition text-left flex items-center gap-3">
                <span className="text-xl">📊</span>
                <span>MLflow</span>
              </button>
            </div>

            <button
              onClick={() => setShowConnectModal(false)}
              className="w-full mt-6 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Integrations;
