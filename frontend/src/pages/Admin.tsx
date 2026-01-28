import React, { useState } from 'react';
import { Edit2, Trash2, Plus, Shield } from 'lucide-react';

const Admin: React.FC = () => {
  const [users, setUsers] = useState([
    {
      id: '1',
      email: 'alice@org.com',
      name: 'Alice Johnson',
      role: 'ml-engineer',
      status: 'active',
      teams: ['Data', 'Models'],
    },
    {
      id: '2',
      email: 'bob@org.com',
      name: 'Bob Smith',
      role: 'data-engineer',
      status: 'active',
      teams: ['Data'],
    },
    {
      id: '3',
      email: 'carol@org.com',
      name: 'Carol Davis',
      role: 'model-sponsor',
      status: 'active',
      teams: ['Stakeholders'],
    },
    {
      id: '4',
      email: 'diana@org.com',
      name: 'Diana Wilson',
      role: 'admin',
      status: 'active',
      teams: ['Admin'],
    },
  ]);

  const roles = [
    { id: 'ml-engineer', name: 'ML Engineer', permissions: ['create_pipelines', 'register_models', 'deploy_to_dev'] },
    { id: 'data-engineer', name: 'Data Engineer', permissions: ['ingest_data', 'prepare_data', 'create_features'] },
    { id: 'data-scientist', name: 'Data Scientist', permissions: ['analyze_data', 'explore_features'] },
    { id: 'prod-team', name: 'Production Team', permissions: ['deploy_to_staging', 'deploy_to_prod', 'approve_promotion'] },
    { id: 'monitoring-team', name: 'Monitoring Team', permissions: ['view_monitoring', 'create_alerts', 'acknowledge_alerts'] },
    { id: 'model-sponsor', name: 'Model Sponsor', permissions: ['view_dashboards', 'view_models'] },
    { id: 'admin', name: 'Administrator', permissions: ['all'] },
  ];

  const [showUserModal, setShowUserModal] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', name: '', role: 'ml-engineer' });

  const handleAddUser = () => {
    const user = {
      id: (users.length + 1).toString(),
      ...newUser,
      status: 'active',
      teams: [],
    };
    setUsers([...users, user]);
    setShowUserModal(false);
    setNewUser({ email: '', name: '', role: 'ml-engineer' });
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      'ml-engineer': 'bg-blue-600/20 text-blue-400',
      'data-engineer': 'bg-green-600/20 text-green-400',
      'prod-team': 'bg-red-600/20 text-red-400',
      'monitoring-team': 'bg-yellow-600/20 text-yellow-400',
      'model-sponsor': 'bg-purple-600/20 text-purple-400',
      'admin': 'bg-pink-600/20 text-pink-400',
    };
    return colors[role] || 'bg-gray-600/20 text-gray-400';
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Administration</h1>

      {/* Demo Credentials */}
      <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-lg p-6 border border-blue-500/50">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Shield size={20} className="text-blue-400" />
          Demo Credentials by Account Type
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-800/50 rounded p-4 border border-gray-700">
            <p className="text-sm font-medium text-blue-300 mb-2">Admin User</p>
            <div className="space-y-1 text-xs">
              <p><span className="text-gray-400">Email:</span> <span className="text-gray-100 font-mono">admin@mlops.com</span></p>
              <p><span className="text-gray-400">Password:</span> <span className="text-gray-100 font-mono">password</span></p>
              <p><span className="text-gray-400">Role:</span> <span className="text-pink-400">Administrator</span></p>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded p-4 border border-gray-700">
            <p className="text-sm font-medium text-blue-300 mb-2">ML Engineer</p>
            <div className="space-y-1 text-xs">
              <p><span className="text-gray-400">Email:</span> <span className="text-gray-100 font-mono">alice@org.com</span></p>
              <p><span className="text-gray-400">Password:</span> <span className="text-gray-100 font-mono">password</span></p>
              <p><span className="text-gray-400">Role:</span> <span className="text-blue-400">ML Engineer</span></p>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded p-4 border border-gray-700">
            <p className="text-sm font-medium text-blue-300 mb-2">Data Engineer</p>
            <div className="space-y-1 text-xs">
              <p><span className="text-gray-400">Email:</span> <span className="text-gray-100 font-mono">bob@org.com</span></p>
              <p><span className="text-gray-400">Password:</span> <span className="text-gray-100 font-mono">password</span></p>
              <p><span className="text-gray-400">Role:</span> <span className="text-green-400">Data Engineer</span></p>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded p-4 border border-gray-700">
            <p className="text-sm font-medium text-blue-300 mb-2">Model Sponsor</p>
            <div className="space-y-1 text-xs">
              <p><span className="text-gray-400">Email:</span> <span className="text-gray-100 font-mono">carol@org.com</span></p>
              <p><span className="text-gray-400">Password:</span> <span className="text-gray-100 font-mono">password</span></p>
              <p><span className="text-gray-400">Role:</span> <span className="text-purple-400">Model Sponsor</span></p>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded p-4 border border-gray-700">
            <p className="text-sm font-medium text-blue-300 mb-2">Data Scientist</p>
            <div className="space-y-1 text-xs">
              <p><span className="text-gray-400">Email:</span> <span className="text-gray-100 font-mono">david@org.com</span></p>
              <p><span className="text-gray-400">Password:</span> <span className="text-gray-100 font-mono">password</span></p>
              <p><span className="text-gray-400">Role:</span> <span className="text-indigo-400">Data Scientist</span></p>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded p-4 border border-gray-700">
            <p className="text-sm font-medium text-blue-300 mb-2">Production Team</p>
            <div className="space-y-1 text-xs">
              <p><span className="text-gray-400">Email:</span> <span className="text-gray-100 font-mono">prod@org.com</span></p>
              <p><span className="text-gray-400">Password:</span> <span className="text-gray-100 font-mono">password</span></p>
              <p><span className="text-gray-400">Role:</span> <span className="text-red-400">Production Team</span></p>
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-4">💡 Tip: Use any of these credentials to test different user roles and their permissions</p>
      </div>
      {/* User Management */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">User Management</h3>
          <button
            onClick={() => setShowUserModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition text-sm"
          >
            <Plus className="w-4 h-4" />
            Add User
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-700">
              <tr>
                <th className="text-left py-3 px-3">Name</th>
                <th className="text-left py-3 px-3">Email</th>
                <th className="text-left py-3 px-3">Role</th>
                <th className="text-left py-3 px-3">Teams</th>
                <th className="text-left py-3 px-3">Status</th>
                <th className="text-left py-3 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-700/30">
                  <td className="py-3 px-3">{user.name}</td>
                  <td className="py-3 px-3 text-gray-400">{user.email}</td>
                  <td className="py-3 px-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      {roles.find(r => r.id === user.role)?.name}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-gray-400">{user.teams.join(', ')}</td>
                  <td className="py-3 px-3">
                    <span className="text-green-400 text-xs">● {user.status}</span>
                  </td>
                  <td className="py-3 px-3 flex gap-2">
                    <button className="p-1 hover:bg-gray-600 rounded">
                      <Edit2 className="w-4 h-4 text-gray-400" />
                    </button>
                    <button className="p-1 hover:bg-gray-600 rounded">
                      <Trash2 className="w-4 h-4 text-gray-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Definitions */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold mb-4">Role Definitions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roles.map((role) => (
            <div key={role.id} className="border border-gray-700 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium">{role.name}</h4>
                  <p className="text-xs text-gray-400 mt-1">{role.id}</p>
                </div>
                <Shield className="w-4 h-4 text-blue-500" />
              </div>
              <div className="space-y-1">
                {role.permissions.map((perm) => (
                  <p key={perm} className="text-xs text-gray-400">✓ {perm.replace('_', ' ')}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold mb-4">System Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Approval Threshold (for Prod)</label>
              <input
                type="number"
                defaultValue="2"
                min="1"
                max="5"
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
              />
              <p className="text-xs text-gray-400 mt-1">Number of approvals required for production deployment</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Drift Alert Threshold (%)</label>
              <input
                type="number"
                defaultValue="10"
                min="0"
                max="100"
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Session Timeout (minutes)</label>
              <input
                type="number"
                defaultValue="480"
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
              />
            </div>

            <button className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition">
              Save Settings
            </button>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Audit & Compliance</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium mb-1">Audit Log Retention</p>
              <input
                type="number"
                defaultValue="365"
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
              />
              <p className="text-xs text-gray-400 mt-1">Days to retain audit logs</p>
            </div>

            <button className="w-full text-sm bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition">
              Export Audit Logs
            </button>

            <button className="w-full text-sm bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition">
              Generate Compliance Report
            </button>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-8 w-full max-w-md border border-gray-700">
            <h2 className="text-2xl font-bold mb-6">Add User</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-100"
                  placeholder="Full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-100"
                  placeholder="user@org.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-100"
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowUserModal(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddUser}
                className="flex-1 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition"
              >
                Add User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
