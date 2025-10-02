import React, { useState } from 'react';
import { DataMigration } from '../../utils/dataMigration';

const MigrationHelper: React.FC = () => {
  const [migrationStatus, setMigrationStatus] = useState<{
    inProgress: boolean;
    completed: boolean;
    entriesMigrated: number;
    alertsMigrated: number;
    errors: string[];
  }>({
    inProgress: false,
    completed: false,
    entriesMigrated: 0,
    alertsMigrated: 0,
    errors: []
  });

  const [connectionStatus, setConnectionStatus] = useState<{
    checked: boolean;
    connected: boolean;
    hasNotes: boolean;
    notesCount: number;
    error?: string;
  }>({
    checked: false,
    connected: false,
    hasNotes: false,
    notesCount: 0
  });

  const checkSupabaseConnection = async () => {
    try {
      const status = await DataMigration.checkSupabaseConnection();
      setConnectionStatus({
        checked: true,
        connected: status.connected,
        hasNotes: status.hasNotes,
        notesCount: status.notesCount,
        error: status.error
      });
    } catch (error) {
      setConnectionStatus({
        checked: true,
        connected: false,
        hasNotes: false,
        notesCount: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  const runMigration = async () => {
    setMigrationStatus(prev => ({ ...prev, inProgress: true }));
    
    try {
      const result = await DataMigration.migrateFromSupabaseToLocal();
      setMigrationStatus({
        inProgress: false,
        completed: true,
        entriesMigrated: result.entriesMigrated,
        alertsMigrated: result.alertsMigrated,
        errors: result.errors
      });
    } catch (error) {
      setMigrationStatus({
        inProgress: false,
        completed: true,
        entriesMigrated: 0,
        alertsMigrated: 0,
        errors: [error instanceof Error ? error.message : 'Migration failed']
      });
    }
  };

  const exportBackup = async () => {
    try {
      await DataMigration.exportLocalDataToFile();
      alert('Backup file downloaded successfully!');
    } catch (error) {
      alert('Failed to export backup: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  return (
    <div className="migration-helper" style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>🔄 Data Migration Helper</h2>
      <p>This tool helps you migrate your existing diary entries from Supabase to local storage.</p>

      {/* Connection Check */}
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h3>📡 Check Supabase Connection</h3>
        <button 
          onClick={checkSupabaseConnection}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Check Connection
        </button>
        
        {connectionStatus.checked && (
          <div style={{ marginTop: '10px' }}>
            {connectionStatus.connected ? (
              <div style={{ color: 'green' }}>
                ✅ Connected to Supabase<br/>
                📊 Found {connectionStatus.notesCount} diary entries
                {connectionStatus.hasNotes && (
                  <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#d4edda', borderRadius: '5px' }}>
                    🎉 Great! You have {connectionStatus.notesCount} diary entries that can be migrated to local storage.
                  </div>
                )}
              </div>
            ) : (
              <div style={{ color: 'red' }}>
                ❌ Cannot connect to Supabase
                {connectionStatus.error && <div>Error: {connectionStatus.error}</div>}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Migration */}
      {connectionStatus.hasNotes && (
        <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>📦 Migrate Your Data</h3>
          <p>This will copy all your diary entries from Supabase to local storage on this device.</p>
          
          <button 
            onClick={runMigration}
            disabled={migrationStatus.inProgress}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: migrationStatus.inProgress ? '#6c757d' : '#28a745', 
              color: 'white', 
              border: 'none', 
              borderRadius: '5px',
              cursor: migrationStatus.inProgress ? 'not-allowed' : 'pointer'
            }}
          >
            {migrationStatus.inProgress ? '🔄 Migrating...' : '🚀 Start Migration'}
          </button>

          {migrationStatus.completed && (
            <div style={{ marginTop: '15px' }}>
              {migrationStatus.entriesMigrated > 0 ? (
                <div style={{ color: 'green' }}>
                  ✅ Migration completed successfully!<br/>
                  📖 Migrated {migrationStatus.entriesMigrated} diary entries<br/>
                  🚨 Migrated {migrationStatus.alertsMigrated} alerts
                </div>
              ) : (
                <div style={{ color: 'orange' }}>
                  ⚠️ Migration completed with issues
                </div>
              )}
              
              {migrationStatus.errors.length > 0 && (
                <div style={{ marginTop: '10px', color: 'red' }}>
                  <strong>Errors:</strong>
                  <ul>
                    {migrationStatus.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Backup */}
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h3>💾 Backup Your Data</h3>
        <p>Export your local diary data to a JSON file for safekeeping.</p>
        
        <button 
          onClick={exportBackup}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#6f42c1', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          📥 Download Backup
        </button>
      </div>

      {/* Instructions */}
      <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h3>📋 Instructions</h3>
        <ol>
          <li><strong>Check Connection:</strong> First, verify that we can connect to your Supabase database</li>
          <li><strong>Migrate Data:</strong> If entries are found, run the migration to copy them to local storage</li>
          <li><strong>Backup:</strong> Download a backup file of your data for safekeeping</li>
          <li><strong>Switch Mode:</strong> The app is now using local storage - your data persists on this device</li>
        </ol>
        
        <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#fff3cd', borderRadius: '5px' }}>
          <strong>💡 Note:</strong> After migration, your diary will work completely offline and won't require Supabase. 
          You can always switch back to Supabase later by updating the configuration.
        </div>
      </div>
    </div>
  );
};

export default MigrationHelper;
