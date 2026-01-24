#!/usr/bin/env node

/**
 * DevFlow Telegram Webhook Manager
 * 
 * This script manages Telegram bot webhook configuration
 * Usage: node telegram-webhook.js <command> [options]
 */

const https = require('https');

// Configuration
const DEFAULT_DOMAIN = 'https://devflow-web.vercel.app';
const API_BASE = 'https://api.telegram.org';

/**
 * Make HTTPS request to Telegram Bot API
 */
function makeRequest(token, method, params = {}) {
  return new Promise((resolve, reject) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE}/bot${token}/${method}?${queryString}`;
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Failed to parse response: ${data}`));
        }
      });
    }).on('error', reject);
  });
}

/**
 * Set webhook for Telegram bot
 */
async function setWebhook(token, domain, options = {}) {
  const webhookUrl = `${domain}/api/webhook/telegram`;
  
  console.log('🔧 Setting Telegram webhook...');
  console.log(`   Token: ${token.substring(0, 10)}...`);
  console.log(`   Webhook URL: ${webhookUrl}`);
  
  try {
    const result = await makeRequest(token, 'setWebhook', {
      url: webhookUrl,
      allowed_updates: options.allowedUpdates || 'message,callback_query',
      max_connections: options.maxConnections || 40,
      drop_pending_updates: options.dropPending ? 'true' : 'false',
    });
    
    if (result.ok) {
      console.log('✅ Webhook set successfully!');
      console.log(`   Description: ${result.description}`);
      return true;
    } else {
      console.error('❌ Failed to set webhook:', result.description);
      return false;
    }
  } catch (error) {
    console.error('❌ Error setting webhook:', error.message);
    return false;
  }
}

/**
 * Get current webhook info
 */
async function getWebhookInfo(token) {
  console.log('🔍 Fetching webhook information...');
  
  try {
    const result = await makeRequest(token, 'getWebhookInfo');
    
    if (result.ok) {
      const info = result.result;
      console.log('\n📋 Current Webhook Configuration:');
      console.log(`   URL: ${info.url || '(not set)'}`);
      console.log(`   Has Custom Certificate: ${info.has_custom_certificate ? 'Yes' : 'No'}`);
      console.log(`   Pending Update Count: ${info.pending_update_count || 0}`);
      console.log(`   Max Allowed Connections: ${info.max_connections || 'default'}`);
      console.log(`   Allowed Updates: ${info.allowed_updates?.join(', ') || 'all'}`);
      console.log(`   Last Error: ${info.last_error_message || 'None'}`);
      console.log(`   Last Error Date: ${info.last_error_date ? new Date(info.last_error_date * 1000).toISOString() : 'N/A'}`);
      
      return info;
    } else {
      console.error('❌ Failed to get webhook info:', result.description);
      return null;
    }
  } catch (error) {
    console.error('❌ Error getting webhook info:', error.message);
    return null;
  }
}

/**
 * Delete webhook
 */
async function deleteWebhook(token, dropPending = false) {
  console.log('🗑️  Deleting webhook...');
  
  try {
    const result = await makeRequest(token, 'deleteWebhook', {
      drop_pending_updates: dropPending ? 'true' : 'false',
    });
    
    if (result.ok) {
      console.log('✅ Webhook deleted successfully');
      return true;
    } else {
      console.error('❌ Failed to delete webhook:', result.description);
      return false;
    }
  } catch (error) {
    console.error('❌ Error deleting webhook:', error.message);
    return false;
  }
}

/**
 * Test webhook by sending a message to bot
 */
async function testWebhook(token) {
  console.log('🧪 Testing webhook...');
  console.log('   (Send a message to your Telegram bot to test)');
  console.log('   Check your application logs for incoming webhook events\n');
}

/**
 * Validate domain
 */
function validateDomain(domain) {
  try {
    const url = new URL(domain);
    if (!url.protocol.startsWith('https')) {
      console.warn('⚠️  Warning: Domain should use HTTPS');
    }
    return true;
  } catch (e) {
    console.error('❌ Invalid domain:', e.message);
    return false;
  }
}

/**
 * Show help
 */
function showHelp() {
  console.log(`
DevFlow Telegram Webhook Manager

Usage:
  node telegram-webhook.js <command> [options]

Commands:
  set <token> [domain]     Set webhook for your bot
                           Domain defaults to: ${DEFAULT_DOMAIN}
                           
  get <token>              Get current webhook configuration
  
  delete <token>           Delete webhook (stops receiving updates)
  
  test <token> [domain]    Test webhook connectivity
  
  help                     Show this help message

Options:
  --domain <url>           Webhook domain (default: ${DEFAULT_DOMAIN})
  --drop-pending           Drop pending updates when setting webhook
  --allowed-updates <list> Comma-separated list of update types
                           (default: message,callback_query)

Examples:
  # Set webhook for production
  node telegram-webhook.js set YOUR_BOT_TOKEN https://devflow-web.vercel.app
  
  # Get current webhook info
  node telegram-webhook.js get YOUR_BOT_TOKEN
  
  # Delete webhook
  node telegram-webhook.js delete YOUR_BOT_TOKEN
  
  # Set with custom domain
  node telegram-webhook.js set YOUR_BOT_TOKEN --domain https://example.com

Environment Variables:
  TELEGRAM_BOT_TOKEN       Bot token (used if not provided as argument)
  TELEGRAM_WEBHOOK_DOMAIN  Webhook domain (used if not provided as argument)
`);
}

/**
 * Main CLI handler
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    showHelp();
    process.exit(0);
  }
  
  const command = args[0];
  
  if (command === 'help') {
    showHelp();
    process.exit(0);
  }
  
  // Get token from args or environment
  let token = args[1] || process.env.TELEGRAM_BOT_TOKEN;
  
  if (!token && (command === 'set' || command === 'get' || command === 'delete' || command === 'test')) {
    console.error('❌ Bot token required!');
    console.error('   Provide as argument: node telegram-webhook.js <command> YOUR_BOT_TOKEN');
    console.error('   Or set TELEGRAM_BOT_TOKEN environment variable\n');
    showHelp();
    process.exit(1);
  }
  
  // Get domain from args or environment
  let domain = args[2] || process.env.TELEGRAM_WEBHOOK_DOMAIN || DEFAULT_DOMAIN;
  
  // Parse --domain flag
  const domainIndex = args.indexOf('--domain');
  if (domainIndex !== -1 && args[domainIndex + 1]) {
    domain = args[domainIndex + 1];
  }
  
  // Validate domain for commands that need it
  if ((command === 'set' || command === 'test') && !validateDomain(domain)) {
    process.exit(1);
  }
  
  try {
    switch (command) {
      case 'set':
        const dropPending = args.includes('--drop-pending');
        const allowedUpdatesIndex = args.indexOf('--allowed-updates');
        const allowedUpdates = allowedUpdatesIndex !== -1 ? args[allowedUpdatesIndex + 1] : undefined;
        
        const success = await setWebhook(token, domain, {
          dropPending,
          allowedUpdates,
        });
        process.exit(success ? 0 : 1);
        break;
        
      case 'get':
        await getWebhookInfo(token);
        break;
        
      case 'delete':
        const dropPendingDelete = args.includes('--drop-pending');
        const deleteSuccess = await deleteWebhook(token, dropPendingDelete);
        process.exit(deleteSuccess ? 0 : 1);
        break;
        
      case 'test':
        await testWebhook(token);
        break;
        
      default:
        console.error(`❌ Unknown command: ${command}`);
        showHelp();
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
