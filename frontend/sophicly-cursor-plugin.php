<?php
/**
 * Plugin Name: Sophicly Designer Cursor
 * Description: Branded designer cursors with name pills and avatars for students, tutors, and AI.
 * Version: 1.3.1
 * Author: Sophicly
 *
 * Enqueues CSS + JS and passes current user data so any page can
 * instantiate: new SophiclyCursor({ name, role, avatarUrl, ... })
 *
 * Other plugins (WML, Dashboard) call SophiclyCursor directly — this
 * plugin just loads the assets and user config.
 */

if ( ! defined( 'ABSPATH' ) ) exit;

define( 'SOPHICLY_CURSOR_VERSION', '1.3.1' );

add_action( 'wp_enqueue_scripts', 'sophicly_cursor_enqueue' );

// Inline critical cursor:none rule in <head> BEFORE any stylesheets load
// This eliminates the default cursor flash on page load
add_action( 'wp_head', 'sophicly_cursor_inline_hide', 1 );

function sophicly_cursor_inline_hide() {
    if ( ! is_user_logged_in() ) return;
    echo '<style id="sophicly-cursor-hide">*,*::before,*::after{cursor:none!important}a,a *,button,button *,[role="button"],[role="button"] *,input,select,textarea,label,summary,[draggable="true"],[onclick]{cursor:pointer!important}iframe{cursor:auto!important}</style>';
    // Remove cursor-hide inside iframes so the parent's custom cursor works naturally
    echo '<script>if(window.self!==window.top){var s=document.getElementById("sophicly-cursor-hide");if(s)s.remove();}</script>';
}

function sophicly_cursor_enqueue() {
    // Only load for logged-in users
    if ( ! is_user_logged_in() ) return;

    $base_url = plugin_dir_url( __FILE__ );

    wp_enqueue_style(
        'sophicly-cursor',
        $base_url . 'sophicly-cursor.css',
        [],
        SOPHICLY_CURSOR_VERSION
    );

    wp_enqueue_script(
        'sophicly-cursor',
        $base_url . 'sophicly-cursor.js',
        [],
        SOPHICLY_CURSOR_VERSION,
        true
    );

    // Pass current user data so any consumer can create a cursor
    $user = wp_get_current_user();
    $first_name = $user->first_name ?: $user->display_name;
    // Take just the first word if display_name is "John Smith"
    if ( strpos( $first_name, ' ' ) !== false ) {
        $first_name = explode( ' ', $first_name )[0];
    }

    $avatar_url = get_avatar_url( $user->ID, [ 'size' => 48 ] );

    // Determine role from WordPress roles
    $role = 'student'; // default
    if ( array_intersect( $user->roles, [ 'administrator', 'tutor', 'group_leader' ] ) ) {
        $role = 'tutor';
    }

    wp_localize_script( 'sophicly-cursor', 'sophiclyCursorConfig', [
        'name'      => $first_name,
        'role'      => $role,
        'avatarUrl' => $avatar_url,
        'userId'    => $user->ID,
    ] );
}
