// One-time migration utility to move localStorage data to Supabase
import { supabase } from '../services/supabaseClient';

interface MigrationResult {
  success: boolean;
  insights: number;
  protocols: number;
  completions: number;
  errors: string[];
}

export async function migratePlaybookToSupabase(): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: false,
    insights: 0,
    protocols: 0,
    completions: 0,
    errors: [],
  };

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      result.errors.push('No authenticated user');
      return result;
    }

    console.log('🔄 Starting migration for user:', user.id);

    // 1. MIGRATE ACTIONABLE INSIGHTS
    try {
      const insightsKey = `insightai_${user.id}_actionable_insights`;
      const storedInsights = localStorage.getItem(insightsKey);
      
      if (storedInsights) {
        const insights = JSON.parse(storedInsights);
        console.log(`📦 Found ${insights.length} insights to migrate`);

        for (const insight of insights) {
          try {
            const { error } = await supabase
              .from('actionable_insights')
              .insert({
                user_id: user.id,
                title: insight.title,
                description: insight.description || '',
                category: insight.category || 'general',
                difficulty: insight.difficulty || 'moderate',
                emoji: insight.emoji || '✨',
                status: insight.status || 'suggested',
                source: insight.source || 'user_created',
                source_entry_id: insight.sourceEntryId || null,
                estimated_time: insight.estimatedTime || null,
                notes: insight.notes || null,
                started_at: insight.startedAt || null,
                completed_at: insight.completedAt || null,
                created_at: insight.createdAt || new Date().toISOString(),
              });

            if (error) {
              console.error('Error migrating insight:', insight.title, error);
              result.errors.push(`Insight: ${insight.title} - ${error.message}`);
            } else {
              result.insights++;
            }
          } catch (err) {
            console.error('Error processing insight:', err);
            result.errors.push(`Insight processing error: ${err}`);
          }
        }

        console.log(`✅ Migrated ${result.insights} actionable insights`);
      } else {
        console.log('ℹ️ No actionable insights found in localStorage');
      }
    } catch (err) {
      console.error('Error in insights migration:', err);
      result.errors.push(`Insights migration: ${err}`);
    }

    // 2. MIGRATE DAILY PROTOCOLS
    try {
      const protocolsStored = localStorage.getItem('insightai_daily_protocols');
      
      if (protocolsStored) {
        const protocols = JSON.parse(protocolsStored);
        console.log(`📦 Found ${protocols.length} protocols to migrate`);

        // First, migrate protocols and store ID mapping
        const protocolIdMap = new Map<string, string>();

        for (const protocol of protocols) {
          try {
            const { data, error } = await supabase
              .from('daily_protocols')
              .insert({
                user_id: user.id,
                title: protocol.title,
                description: protocol.description || '',
                category: protocol.category || 'anytime',
                emoji: protocol.emoji || '⏰',
                is_active: protocol.isActive !== false,
                reminder_time: protocol.reminderTime || null,
                created_at: protocol.createdAt || new Date().toISOString(),
              })
              .select('id')
              .single();

            if (error) {
              console.error('Error migrating protocol:', protocol.title, error);
              result.errors.push(`Protocol: ${protocol.title} - ${error.message}`);
            } else {
              result.protocols++;
              // Store mapping of old ID to new UUID
              protocolIdMap.set(protocol.id, data.id);
            }
          } catch (err) {
            console.error('Error processing protocol:', err);
            result.errors.push(`Protocol processing error: ${err}`);
          }
        }

        console.log(`✅ Migrated ${result.protocols} daily protocols`);

        // 3. MIGRATE DAILY COMPLETIONS (needs protocol ID mapping)
        try {
          const completionsStored = localStorage.getItem('insightai_daily_completions');
          
          if (completionsStored) {
            const completions = JSON.parse(completionsStored);
            console.log(`📦 Found ${completions.length} completions to migrate`);

            for (const completion of completions) {
              try {
                // Map old protocol ID to new UUID
                const newProtocolId = protocolIdMap.get(completion.protocolId);
                
                if (!newProtocolId) {
                  console.warn('Skipping completion - protocol not found:', completion.protocolId);
                  continue;
                }

                const { error } = await supabase
                  .from('daily_completions')
                  .insert({
                    user_id: user.id,
                    protocol_id: newProtocolId,
                    date: completion.date,
                    completed_at: completion.completedAt || new Date().toISOString(),
                  });

                if (error) {
                  // Ignore duplicate errors (same protocol + date)
                  if (!error.message.includes('duplicate')) {
                    console.error('Error migrating completion:', error);
                    result.errors.push(`Completion: ${error.message}`);
                  }
                } else {
                  result.completions++;
                }
              } catch (err) {
                console.error('Error processing completion:', err);
                result.errors.push(`Completion processing error: ${err}`);
              }
            }

            console.log(`✅ Migrated ${result.completions} daily completions`);
          } else {
            console.log('ℹ️ No daily completions found in localStorage');
          }
        } catch (err) {
          console.error('Error in completions migration:', err);
          result.errors.push(`Completions migration: ${err}`);
        }
      } else {
        console.log('ℹ️ No daily protocols found in localStorage');
      }
    } catch (err) {
      console.error('Error in protocols migration:', err);
      result.errors.push(`Protocols migration: ${err}`);
    }

    // 4. MIGRATE INSIGHT PROGRESS (if exists)
    try {
      const progressKey = `insightai_${user.id}_insight_progress`;
      const storedProgress = localStorage.getItem(progressKey);
      
      if (storedProgress) {
        const progressData = JSON.parse(storedProgress);
        console.log(`📦 Found ${progressData.length} progress records to migrate`);

        // Note: This requires mapping old insight IDs to new UUIDs
        // For now, we'll skip this as it's complex without the ID mapping
        console.log('⚠️ Insight progress migration requires manual ID mapping - skipped for now');
      }
    } catch (err) {
      console.error('Error in progress migration:', err);
      result.errors.push(`Progress migration: ${err}`);
    }

    result.success = result.errors.length === 0;
    
    console.log('🎉 Migration complete!', {
      insights: result.insights,
      protocols: result.protocols,
      completions: result.completions,
      errors: result.errors.length,
    });

    return result;
  } catch (error) {
    console.error('Fatal migration error:', error);
    result.errors.push(`Fatal error: ${error}`);
    return result;
  }
}

// Helper function to check if migration is needed
export async function checkMigrationNeeded(): Promise<{
  hasLocalData: boolean;
  insights: number;
  protocols: number;
}> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { hasLocalData: false, insights: 0, protocols: 0 };

    const insightsKey = `insightai_${user.id}_actionable_insights`;
    const storedInsights = localStorage.getItem(insightsKey);
    const insightsCount = storedInsights ? JSON.parse(storedInsights).length : 0;

    const protocolsStored = localStorage.getItem('insightai_daily_protocols');
    const protocolsCount = protocolsStored ? JSON.parse(protocolsStored).length : 0;

    return {
      hasLocalData: insightsCount > 0 || protocolsCount > 0,
      insights: insightsCount,
      protocols: protocolsCount,
    };
  } catch (error) {
    console.error('Error checking migration status:', error);
    return { hasLocalData: false, insights: 0, protocols: 0 };
  }
}
