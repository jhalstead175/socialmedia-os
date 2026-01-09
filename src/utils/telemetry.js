/**
 * Telemetry Utility - Internal Product Signaling
 *
 * Purpose: Lightweight, internal signal hooks for UX friction visibility.
 * NOT for analytics, marketing, or user profiling.
 *
 * Rules:
 * - No data storage
 * - No data transmission
 * - No PII or content logging
 * - No cookies or localStorage
 * - Silent, inert, and removable
 * - Production builds are no-op
 *
 * Event Categories:
 * 1. Navigation intent
 * 2. Tool entry
 * 3. Action attempt
 * 4. Gated action encounter
 * 5. Error-free completion
 */

/**
 * Emit a telemetry event.
 * In development: logs to console.info
 * In production: no-op
 *
 * @param {string} event - Static event name (no interpolation, no IDs)
 * @example
 * emit('nav_dashboard_opened')
 * emit('tool_composer_entered')
 * emit('action_schedule_attempted')
 * emit('gate_plan_limit_encountered')
 * emit('action_completed_ui')
 */
export function emit(event) {
  if (import.meta.env.DEV) {
    console.info('[telemetry]', event);
  }
  // Production: no-op
}

/**
 * Navigation events - when a tool view is entered
 */
export const NAV_EVENTS = {
  DASHBOARD_OPENED: 'nav_dashboard_opened',
  COMPOSER_OPENED: 'nav_composer_opened',
  SCHEDULER_OPENED: 'nav_scheduler_opened',
  ANALYTICS_OPENED: 'nav_analytics_opened',
  INBOX_OPENED: 'nav_inbox_opened',
  ASSETS_OPENED: 'nav_assets_opened'
};

/**
 * Tool entry events - when a user enters a specific tool
 */
export const TOOL_EVENTS = {
  COMPOSER_ENTERED: 'tool_composer_entered',
  SCHEDULER_ENTERED: 'tool_scheduler_entered',
  ANALYTICS_ENTERED: 'tool_analytics_entered',
  INBOX_ENTERED: 'tool_inbox_entered',
  ASSETS_ENTERED: 'tool_assets_entered'
};

/**
 * Action attempt events - when a user attempts an action
 */
export const ACTION_EVENTS = {
  SCHEDULE_ATTEMPTED: 'action_schedule_attempted',
  PUBLISH_ATTEMPTED: 'action_publish_attempted',
  DRAFT_SAVE_ATTEMPTED: 'action_draft_save_attempted',
  ACCOUNT_CONNECT_ATTEMPTED: 'action_account_connect_attempted',
  ASSET_UPLOAD_ATTEMPTED: 'action_asset_upload_attempted',
  PLAN_CHANGE_ATTEMPTED: 'action_plan_change_attempted'
};

/**
 * Gating events - when a limit or requirement blocks an action
 */
export const GATE_EVENTS = {
  PLAN_LIMIT_ENCOUNTERED: 'gate_plan_limit_encountered',
  OAUTH_REQUIRED_ENCOUNTERED: 'gate_oauth_required_encountered',
  READONLY_STATE_ENCOUNTERED: 'gate_readonly_state_encountered'
};

/**
 * Completion events - when an action completes successfully (UI-level)
 */
export const COMPLETION_EVENTS = {
  ACTION_COMPLETED_UI: 'action_completed_ui',
  MODAL_CLOSED_SUCCESS: 'modal_closed_success',
  DRAFT_SAVE_CONFIRMED: 'draft_save_confirmed',
  PLACEHOLDER_CONFIRMATION_SHOWN: 'placeholder_confirmation_shown'
};
