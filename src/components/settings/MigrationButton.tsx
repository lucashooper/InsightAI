// Migration button component for Settings page
import React, { useState, useEffect } from 'react';
import { migratePlaybookToSupabase, checkMigrationNeeded } from '../../utils/migrateToSupabase';

export function MigrationButton() {
  const [migrationStatus, setMigrationStatus] = useState<{
    hasLocalData: boolean;
    insights: number;
    protocols: number;
  } | null>(null);
  const [migrating, setMigrating] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    checkMigrationNeeded().then(setMigrationStatus);
  }, []);

  const handleMigrate = async () => {
    if (!confirm('This will migrate your Playbook data from localStorage to Supabase. Continue?')) {
      return;
    }

    setMigrating(true);
    setResult(null);

    try {
      const migrationResult = await migratePlaybookToSupabase();
      setResult(migrationResult);
      
      if (migrationResult.success) {
        alert(`✅ Migration successful!\n\n` +
          `Insights: ${migrationResult.insights}\n` +
          `Protocols: ${migrationResult.protocols}\n` +
          `Completions: ${migrationResult.completions}\n\n` +
          `Your data is now synced across devices!`);
        
        // Refresh to load from Supabase
        window.location.reload();
      } else {
        alert(`⚠️ Migration completed with errors:\n\n${migrationResult.errors.join('\n')}`);
      }
    } catch (error) {
      alert(`❌ Migration failed: ${error}`);
    } finally {
      setMigrating(false);
    }
  };

  if (!migrationStatus?.hasLocalData) {
    return null; // No local data to migrate
  }

  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#1a1a1a',
      borderRadius: '12px',
      border: '1px solid #8b5cf6',
      marginBottom: '20px',
    }}>
      <h3 style={{ color: '#ffffff', marginBottom: '12px', fontSize: '18px' }}>
        🔄 Migrate Playbook Data
      </h3>
      <p style={{ color: '#999', marginBottom: '16px', fontSize: '14px' }}>
        You have <strong>{migrationStatus.insights} strategies</strong> and{' '}
        <strong>{migrationStatus.protocols} protocols</strong> in local storage.
        <br />
        Migrate them to Supabase for cross-device sync.
      </p>
      
      <button
        onClick={handleMigrate}
        disabled={migrating}
        style={{
          padding: '12px 24px',
          backgroundColor: migrating ? '#666' : '#8b5cf6',
          color: '#ffffff',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: migrating ? 'not-allowed' : 'pointer',
          opacity: migrating ? 0.6 : 1,
        }}
      >
        {migrating ? 'Migrating...' : 'Migrate Now'}
      </button>

      {result && (
        <div style={{
          marginTop: '16px',
          padding: '12px',
          backgroundColor: result.success ? '#10b98120' : '#ef444420',
          borderRadius: '8px',
          color: result.success ? '#10b981' : '#ef4444',
          fontSize: '14px',
        }}>
          {result.success ? (
            <div>
              ✅ Successfully migrated {result.insights + result.protocols + result.completions} items!
            </div>
          ) : (
            <div>
              ⚠️ {result.errors.length} errors occurred during migration
            </div>
          )}
        </div>
      )}
    </div>
  );
}
