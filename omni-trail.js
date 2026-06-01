// ==UserScript==
// @name         万象 · Omni Trail
// @namespace    https://new.rth1.xyz/omni-trail.js
// @version      1.1.0
// @description  浏览器悬浮球全能助手：追剧进度管理、网页导航收藏、Markdown笔记、18套主题、Bangumi元数据刮削、WebDAV云同步
// @author       u-luck & AI
// @match        *://*/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addValueChangeListener
// @grant        GM_registerMenuCommand
// @grant        GM_notification
// @grant        GM_openInTab
// @grant        GM.xmlHttpRequest
// @license      MIT
// @require      https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js
// @run-at       document-idle
// ==/UserScript==

(function () {
	'use strict';

	// ═══════════════════════════════════════════════════════
	//  CONSTANTS
	// ═══════════════════════════════════════════════════════
	const KEY_DATA = 'cine_data_v1';
	const KEY_SETTINGS = 'cine_settings_v1';
	const KEY_PLATFORMS = 'cine_platforms_v1';
	const KEY_PLATFORM_CATS = 'cine_platform_categories_v1';
	const KEY_NAV_CATS = 'cine_nav_categories_v1';
	const KEY_NAV_LINKS = 'cine_nav_links_v1';
	const KEY_NAV_ENGINES = 'cine_nav_engines_v1';
	const KEY_NOTES = 'cine_notes_v1';
	const KEY_TIMER = 'cine_timer_v1';
	const KEY_TODOS = 'cine_todos_v1';
	const KEY_MARKS = 'cine_marks_v1';
	const KEY_QUOTE = 'cine_quote_v1';
	// !! 同步更新下方 @version !!
	const VERSION = '1.1.0';

	const KEY_WEBDAV = 'cine_webdav_v1';
	const DEFAULT_WEBDAV = {
		server: 'https://dav.jianguoyun.com/dav/',
		username: '',
		password: '',
		filename: 'omni-trail_backup.json',
		syncOption: 'ask',
		lastSyncTime: 0,
	};

	const HELP_URL = 'https://new.rth1.xyz/omni-trail-help.html';
	const SPACE_URL = 'https://space.bilibili.com/477727571';

	const DEFAULT_STATUSES = [
		{ id: 'watching', label: '正在追', color: '#6ee7b7' },
		{ id: 'todo', label: '想看', color: '#fcd34d' },
		{ id: 'finished', label: '已看完', color: '#93c5fd' },
		{ id: 'paused', label: '暂停中', color: '#d8b4fe' },
		{ id: 'dropped', label: '已弃剧', color: '#fca5a5' },
	];

	const DEFAULT_TYPES = [
		{ name: '动漫', single: false },
		{ name: '国产剧', single: false },
		{ name: '美剧', single: false },
		{ name: '日韩剧', single: false },
		{ name: '电影', single: true },
		{ name: '纪录片', single: true },
		{ name: '综艺', single: false },
		{ name: '短视频', single: false },
		{ name: '其他', single: false },
	];

	const DEFAULT_PLATFORM_CATEGORIES = [
		{ id: 'mainstream', name: '主流平台', color: '#3b82f6' },
		{ id: 'custom', name: '其他平台', color: '#c61212' },
	];

	const DEFAULT_PLATFORMS = [
		// { id: 'cp_main_iqiyi', category: 'mainstream', name: '爱奇艺', url: 'https://www.iqiyi.com/', icon: '', sortOrder: 0 },
		// { id: 'cp_main_youku', category: 'mainstream', name: '优酷', url: 'https://www.youku.com/ku/webhome', icon: '', sortOrder: 1 },
		// { id: 'cp_main_tencent', category: 'mainstream', name: '腾讯视频', url: 'https://v.qq.com/', icon: '', sortOrder: 2 },
		// { id: 'cp_main_mango', category: 'mainstream', name: '芒果TV', url: 'https://www.mgtv.com/', icon: '', sortOrder: 3 },
		// { id: 'cp_main_bilibili', category: 'mainstream', name: '哔哩哔哩', url: 'https://www.bilibili.com/', icon: '', sortOrder: 4 },
		// { id: 'cp_main_douyin', category: 'mainstream', name: '抖音', url: 'https://www.douyin.com/', icon: '', sortOrder: 5 },
		// { id: 'cp_cust_cz', category: 'custom', name: '厂长资源', url: 'https://www.czzyv.com/', icon: '', sortOrder: 6 },
		// { id: 'cp_cust_ikanbot', category: 'custom', name: '爱看机器人', url: 'https://v.ikanbot.com/', icon: '', sortOrder: 7 },
		// { id: 'cp_cust_iyf', category: 'custom', name: '爱壹帆', url: 'https://www.iyf.tv/', icon: '', sortOrder: 8 },
		// { id: 'cp_cust_kimivod', category: 'custom', name: 'Kimivod', url: 'https://kimivod.org/', icon: '', sortOrder: 9 },
	];

	const DEFAULT_NAV_CATEGORIES = [
		{ id: 'common', name: '常用', icon: '⭐' },
	];
	const DEFAULT_NAV_LINKS = [];
	const DEFAULT_NAV_ENGINES = [
		{ id: 'bing', name: 'Bing', icon: '🔍', url: 'https://www.bing.com/search?q={q}', isDefault: true, order: 1 },
		{ id: 'google', name: 'Google', icon: '🌐', url: 'https://www.google.com/search?q={q}', isDefault: true, order: 2 },
		{ id: 'sougou', name: 'Sougou', icon: '🐕', url: 'https://www.sogou.com/web?query={q}', isDefault: true, order: 3 },
		{ id: 'baidu', name: 'Baidu', icon: '🔍', url: 'https://www.baidu.com/s?wd={q}', isDefault: true, order: 4 },
	];
	const MAX_NAV_CUSTOM_ENGINES = 20;
	const NAV_EMOJI_PRESETS = ['⭐', '🔥', '💻', '🎨', '🤖', '🌐', '📁', '🎬', '📺', '🔗', '🎵', '📚', '🔍', '📝', '💡', '🚀', '🎮', '📷', '🎓', '🧰', '💼'];

	const DEFAULT_TIMER = {
		mode: 'clock',
		countdown: { targetTs: 0, duration: 300, label: '' },
		stopwatch: { startTs: 0, elapsed: 0, running: false },
		pomodoro: {
			workMinutes: 25, breakMinutes: 5, longBreakMinutes: 15, sessionsBeforeLong: 4,
			targetTs: 0, phase: 'work', sessionCount: 0, running: false,
			todayCount: 0, todayDate: '', totalHistory: [],
		},
	};

	// 主题定义：dark=深色，pair=对应的明/暗互换主题
	const THEMES = {
		// 深色（Dark）— surface/surfaceHigh 使用 rgba 0.85/0.90 实现统一半透明
		glassDark: { name: '毛玻璃深', dark: true, bg: '#0f172a', surface: 'rgba(30,41,59,0.85)', surfaceHigh: 'rgba(51,65,85,0.90)', border: 'rgba(255,255,255,0.12)', text: '#f1f5f9', muted: '#94a3b8', accent: '#818cf8', accentDim: 'rgba(129,140,248,0.15)', pair: 'glassLight' },
		obsidian: { name: '黑曜石', dark: true, bg: '#07070a', surface: 'rgba(24,24,27,0.85)', surfaceHigh: 'rgba(39,39,42,0.90)', border: 'rgba(255,255,255,0.12)', text: '#fafafa', muted: '#a1a1aa', accent: '#e879f9', accentDim: 'rgba(232,121,249,0.15)', pair: 'chalk' },
		aurora: { name: '极光蓝', dark: true, bg: '#020818', surface: 'rgba(14,27,54,0.85)', surfaceHigh: 'rgba(20,34,68,0.90)', border: 'rgba(255,255,255,0.12)', text: '#e6f0ff', muted: '#6c8bb3', accent: '#38bdf8', accentDim: 'rgba(56,189,248,0.15)', pair: 'sky' },
		forest: { name: '暗森', dark: true, bg: '#030d08', surface: 'rgba(10,31,18,0.85)', surfaceHigh: 'rgba(16,47,30,0.90)', border: 'rgba(255,255,255,0.12)', text: '#ecfdf5', muted: '#55806a', accent: '#4ade80', accentDim: 'rgba(74,222,128,0.15)', pair: 'mint' },
		volcano: { name: '火山橙', dark: true, bg: '#0f0800', surface: 'rgba(31,18,0,0.85)', surfaceHigh: 'rgba(48,28,0,0.90)', border: 'rgba(255,255,255,0.12)', text: '#fff7ed', muted: '#b0703a', accent: '#fb923c', accentDim: 'rgba(251,146,60,0.15)', pair: 'orange' },
		crimson: { name: '深红', dark: true, bg: '#0c0007', surface: 'rgba(28,0,18,0.85)', surfaceHigh: 'rgba(45,0,27,0.90)', border: 'rgba(255,255,255,0.12)', text: '#fff1f4', muted: '#b06878', accent: '#fb7185', accentDim: 'rgba(251,113,133,0.15)', pair: 'sakura' },
		midnight: { name: '午夜靛', dark: true, bg: '#0d0d1a', surface: 'rgba(20,20,46,0.85)', surfaceHigh: 'rgba(30,30,66,0.90)', border: 'rgba(255,255,255,0.12)', text: '#eeefff', muted: '#6b6fa8', accent: '#818cf8', accentDim: 'rgba(129,140,248,0.15)', pair: 'lavender' },
		ultraviolet: { name: '极紫', dark: true, bg: '#0f0020', surface: 'rgba(31,0,54,0.85)', surfaceHigh: 'rgba(46,0,74,0.90)', border: 'rgba(255,255,255,0.12)', text: '#f5f0ff', muted: '#9f7fd6', accent: '#c084fc', accentDim: 'rgba(192,132,252,0.15)', pair: 'lightpurple' },
		lime: { name: '青柠暗', dark: true, bg: '#050f03', surface: 'rgba(12,35,10,0.85)', surfaceHigh: 'rgba(20,54,18,0.90)', border: 'rgba(255,255,255,0.12)', text: '#f0ffe5', muted: '#648a4a', accent: '#84cc16', accentDim: 'rgba(132,204,22,0.15)', pair: 'lightlime' },
		// 浅色（Light）— surface/surfaceHigh 使用 rgba 0.90/0.95 实现统一半透明
		glassLight: { name: '毛玻璃浅', dark: false, bg: '#f8fafc', surface: 'rgba(255,255,255,0.90)', surfaceHigh: 'rgba(255,255,255,0.95)', border: 'rgba(0,0,0,0.08)', text: '#1e293b', muted: '#64748b', accent: '#6366f1', accentDim: 'rgba(99,102,241,0.14)', pair: 'glassDark' },
		chalk: { name: '粉笔白', dark: false, bg: '#fafaf9', surface: 'rgba(245,245,244,0.90)', surfaceHigh: 'rgba(231,229,228,0.95)', border: 'rgba(0,0,0,0.08)', text: '#1b1917', muted: '#78716c', accent: '#7c3aed', accentDim: 'rgba(124,58,237,0.14)', pair: 'obsidian' },
		sky: { name: '天空蓝', dark: false, bg: '#f0f9ff', surface: 'rgba(224,242,254,0.90)', surfaceHigh: 'rgba(186,230,253,0.95)', border: 'rgba(0,0,0,0.08)', text: '#082f49', muted: '#0c4a6e', accent: '#0ea5e9', accentDim: 'rgba(14,165,233,0.14)', pair: 'aurora' },
		mint: { name: '薄荷绿', dark: false, bg: '#f0fdf4', surface: 'rgba(220,252,231,0.90)', surfaceHigh: 'rgba(187,247,208,0.95)', border: 'rgba(0,0,0,0.08)', text: '#052e16', muted: '#166534', accent: '#22c55e', accentDim: 'rgba(34,197,94,0.14)', pair: 'forest' },
		orange: { name: '琥珀橙', dark: false, bg: '#fff7ed', surface: 'rgba(255,237,213,0.90)', surfaceHigh: 'rgba(254,215,170,0.95)', border: 'rgba(0,0,0,0.08)', text: '#431407', muted: '#9a3412', accent: '#f97316', accentDim: 'rgba(249,115,22,0.14)', pair: 'volcano' },
		sakura: { name: '樱粉', dark: false, bg: '#fff5f7', surface: 'rgba(255,228,233,0.90)', surfaceHigh: 'rgba(254,205,211,0.95)', border: 'rgba(0,0,0,0.08)', text: '#4c0519', muted: '#9d174d', accent: '#f472b6', accentDim: 'rgba(244,114,182,0.14)', pair: 'crimson' },
		lavender: { name: '淡靛', dark: false, bg: '#f5f8ff', surface: 'rgba(232,237,252,0.90)', surfaceHigh: 'rgba(206,214,242,0.95)', border: 'rgba(0,0,0,0.08)', text: '#1a1c40', muted: '#4a4f80', accent: '#818cf8', accentDim: 'rgba(129,140,248,0.14)', pair: 'midnight' },
		lightpurple: { name: '淡紫', dark: false, bg: '#faf7ff', surface: 'rgba(241,234,255,0.90)', surfaceHigh: 'rgba(224,212,252,0.95)', border: 'rgba(0,0,0,0.08)', text: '#2d0050', muted: '#6a4b9e', accent: '#c084fc', accentDim: 'rgba(192,132,252,0.14)', pair: 'ultraviolet' },
		lightlime: { name: '浅青柠', dark: false, bg: '#f2ffe5', surface: 'rgba(231,255,204,0.90)', surfaceHigh: 'rgba(210,250,160,0.95)', border: 'rgba(0,0,0,0.08)', text: '#1e3008', muted: '#4a661d', accent: '#84cc16', accentDim: 'rgba(132,204,22,0.14)', pair: 'lime' },
	};

	const FONTS = {
		system: { name: '系统默认 (苹方/HarmonyOS)', family: "system-ui, 'PingFang SC', 'HarmonyOS Sans', sans-serif", url: '' },
		noto: { name: 'Noto Sans SC (思源黑体)', family: "'Noto Sans SC', sans-serif", url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;700&display=swap' },
		serif: { name: 'Noto Serif SC (思源宋体)', family: "'Noto Serif SC', serif", url: 'https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;500;700&display=swap' },
		xiaowei: { name: 'ZCOOL XiaoWei (站酷小薇)', family: "'ZCOOL XiaoWei', sans-serif", url: 'https://fonts.googleapis.com/css2?family=ZCOOL+XiaoWei&display=swap' },
		longcang: { name: 'Long Cang (龙藏手写)', family: "'Long Cang', cursive", url: 'https://fonts.googleapis.com/css2?family=Long+Cang&display=swap' },
		georgia: { name: 'Georgia (衬线)', family: "'Georgia', 'Noto Serif SC', serif", url: '' },
		mono: { name: 'JetBrains Mono (等宽)', family: "'JetBrains Mono', monospace", url: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap' },
	};

	const DEFAULT_UI = {
		mainWidth: 900,
		editWidth: 420,
		settingsWidth: 600,
		opacity: 0.70,
		blur: 18,
		radius: 14,
		radiusSm: 8,
		platformIconRadius: 12,
		fontSize: 17,
		mainHeightAuto: false,
		mainHeightMin: 720,
		mainHeightMax: 720,
	};

	const DEFAULT_BALL = {
		size: 40,
		bgOpacity: 0.50,
	};

	const DEFAULT_VIDEO_PARSERS = [
		{ name: '默认A', url: 'https://json.fongmi.cc/web?url=', enabled: true },
		{ name: '默认B', url: 'https://super.playr.top/?url=', enabled: true },
		{ name: 'CK解析', url: 'https://www.ckplayer.vip/jiexi/?url=', enabled: true },
		{ name: 'Player-JY', url: 'https://jx.playerjy.com/?url=', enabled: true },
		{ name: '虾米解析', url: 'https://jx.xmflv.com/?url=', enabled: true },
		{ name: '789解析', url: 'https://jiexi.789jiexi.icu:4433/?url=', enabled: true },
		{ name: '937解析', url: 'https://bfq.937auth.vip?url=', enabled: true },
		{ name: 'HLS解析', url: 'https://jx.hls.one/?url=', enabled: true },
		{ name: '极速解析', url: 'https://jx.2s0.cn/player/?url=', enabled: true },
		{ name: '冰豆解析', url: 'https://bd.jx.cn/?url=', enabled: true },
		{ name: '剖元解析', url: 'https://www.pouyun.com/?url=', enabled: true },
		{ name: '973解析', url: 'https://jx.973973.xyz/?url=', enabled: true },
		{ name: '七哥解析', url: 'https://jx.nnxv.cn/tv.php?url=', enabled: true },
		{ name: 'playm3u8', url: 'https://www.playm3u8.cn/jiexi.php?url=', enabled: true },
		{ name: '七七云解析', url: 'https://jx.77flv.cc/?url=', enabled: true },
		{ name: '芒果TV1', url: 'https://video.isyour.love/player/getplayer?url=', enabled: true },
		{ name: 'M1907', url: 'https://im1907.top/?jx=', enabled: true },
		{ name: 'Yparse', url: 'https://jx.yparse.com/index.php?url=', enabled: true },
	];

	const VIDEO_HOSTS = [
		'v.qq.com', 'm.v.qq.com', 'www.iqiyi.com', 'm.iqiyi.com', 'www.iq.com',
		'v.youku.com', 'm.youku.com', 'www.bilibili.com', 'm.bilibili.com',
		'www.mgtv.com', 'm.mgtv.com', 'w.mgtv.com', 'tv.sohu.com', 'film.sohu.com',
		'www.le.com', 'v.pptv.com', 'vip.pptv.com', 'www.wasu.cn',
		'www.acfun.cn', 'www.1905.com', 'vip.1905.com', 'video.tudou.com',
	];

	const PLAYER_CONTAINERS = [
		{ host: 'v.qq.com', container: '#mod_player,#player-container,.container-player', displayNodes: ['#mask_layer','.mod_vip_popup','.panel-tip-pay'] },
		{ host: 'm.v.qq.com', container: '.mod_player,#player', displayNodes: ['.mod_vip_popup','div[dt-eid=open_app_bottom]'] },
		{ host: 'www.iqiyi.com', container: '#areaLeftContainer,#outlayer,.iqp-player-videolayer', displayNodes: ['#playerPopup','#vipCoversBox','div.iqp-player-vipmask','div.iqp-player-paymask','div.iqp-player-loginmask'] },
		{ host: 'm.iqiyi.com', container: '.m-video-player-wrap,.iqp-player-videolayer', displayNodes: ['div.m-iqyGuide-layer','div.iqp-player-vipmask'] },
		{ host: 'www.iq.com', container: '.intl-video-wrap', displayNodes: [] },
		{ host: 'v.youku.com', container: '.player-container,#ykPlayer,#playerMouseWheel', displayNodes: ['#iframaWrapper','#video_side_cashier'] },
		{ host: 'm.youku.com', container: '#playerMouseWheel,.h5-detail-player', displayNodes: [] },
		{ host: 'www.bilibili.com', container: '#player_module,#bilibiliPlayer,#bilibili-player', displayNodes: [] },
		{ host: 'm.bilibili.com', container: '.player-wrapper,.player-container,.mplayer', displayNodes: [] },
		{ host: 'www.mgtv.com', container: '#mgtv-player-wrap', displayNodes: [] },
		{ host: 'm.mgtv.com', container: '.video-area', displayNodes: ['div.adFixedContain'] },
		{ host: 'w.mgtv.com', container: '#mgtv-player-wrap', displayNodes: [] },
		{ host: 'tv.sohu.com', container: '#player', displayNodes: [] },
		{ host: 'film.sohu.com', container: '#playerWrap', displayNodes: [] },
		{ host: 'www.le.com', container: '#le_playbox', displayNodes: [] },
		{ host: 'video.tudou.com', container: '.td-playbox', displayNodes: [] },
		{ host: 'v.pptv.com', container: '#pptv_playpage_box', displayNodes: [] },
		{ host: 'vip.pptv.com', container: '.w-video', displayNodes: [] },
		{ host: 'www.wasu.cn', container: '#flashContent', displayNodes: [] },
		{ host: 'www.acfun.cn', container: '#player', displayNodes: [] },
		{ host: 'www.1905.com', container: '#player,#vodPlayer', displayNodes: [] },
		{ host: 'vip.1905.com', container: '#player,#vodPlayer', displayNodes: [] },
	];

	// ═══════════════════════════════════════════════════════
	//  农历转换 (1900-2100)
	// ═══════════════════════════════════════════════════════
	const LUNAR_INFO = [
		0x04bd8,0x04ae0,0x0a570,0x054d5,0x0d260,0x0d950,0x16554,0x056a0,0x09ad0,0x055d2, // 1900-1909
		0x04ae0,0x0a5b6,0x0a4d0,0x0d250,0x1d255,0x0b540,0x0d6a0,0x0ada2,0x095b0,0x14977, // 1910-1919
		0x04970,0x0a4b0,0x0b4b5,0x06a50,0x06d40,0x1ab54,0x02b60,0x09570,0x052f2,0x04970, // 1920-1929
		0x06566,0x0d4a0,0x0ea50,0x16a95,0x05ad0,0x02b60,0x186e3,0x092e0,0x1c8d7,0x0c950, // 1930-1939
		0x0d4a0,0x1d8a6,0x0b550,0x056a0,0x1a5b4,0x025d0,0x092d0,0x0d2b2,0x0a950,0x0b557, // 1940-1949
		0x06ca0,0x0b550,0x15355,0x04da0,0x0a5b0,0x14573,0x052b0,0x0a9a8,0x0e950,0x06aa0, // 1950-1959
		0x0aea6,0x0ab50,0x04b60,0x0aae4,0x0a570,0x05260,0x0f263,0x0d950,0x05b57,0x056a0, // 1960-1969
		0x096d0,0x04dd5,0x04ad0,0x0a4d0,0x0d4d4,0x0d250,0x0d558,0x0b540,0x0b6a0,0x195a6, // 1970-1979
		0x095b0,0x049b0,0x0a974,0x0a4b0,0x0b27a,0x06a50,0x06d40,0x0af46,0x0ab60,0x09570, // 1980-1989
		0x04af5,0x04970,0x064b0,0x074a3,0x0ea50,0x06b58,0x05ac0,0x0ab60,0x096d5,0x092e0, // 1990-1999
		0x0c960,0x0d954,0x0d4a0,0x0da50,0x07552,0x056a0,0x0abb7,0x025d0,0x092d0,0x0cab5, // 2000-2009
		0x0a950,0x0b4a0,0x0baa4,0x0ad50,0x055d9,0x04ba0,0x0a5b0,0x15176,0x052b0,0x0a930, // 2010-2019
		0x07954,0x06aa0,0x0ad50,0x05b52,0x04b60,0x0a6e6,0x0a4e0,0x0d260,0x0ea65,0x0d530, // 2020-2029
		0x05aa0,0x076a3,0x096d0,0x04afb,0x04ad0,0x0a4d0,0x1d0b6,0x0d250,0x0d520,0x0dd45, // 2030-2039
		0x0b5a0,0x056d0,0x055b2,0x049b0,0x0a577,0x0a4b0,0x0aa50,0x1b255,0x06d20,0x0ada0, // 2040-2049
		0x14b63,0x09370,0x049f8,0x04970,0x064b0,0x168a6,0x0ea50,0x06aa0,0x1a6c4,0x0aae0, // 2050-2059
		0x092e0,0x0d2e3,0x0c960,0x0d557,0x0d4a0,0x0da50,0x05d55,0x056a0,0x0a6d0,0x055d4, // 2060-2069
		0x052d0,0x0a9b8,0x0a950,0x0b4a0,0x0b6a6,0x0ad50,0x055a0,0x0aba4,0x0a5b0,0x052b0, // 2070-2079
		0x0b273,0x06930,0x07337,0x06aa0,0x0ad50,0x14b55,0x04b60,0x0a570,0x054e4,0x0d160, // 2080-2089
		0x0e968,0x0d520,0x0daa0,0x16aa6,0x056d0,0x04ae0,0x0a9d4,0x0a4d0,0x0d150,0x0f252, // 2090-2099
		0x0d520, // 2100
	];

	const LUNAR_MONTH_NAMES = ['正','二','三','四','五','六','七','八','九','十','冬','腊'];
	const LUNAR_DAY_NAMES = ['初一','初二','初三','初四','初五','初六','初七','初八','初九','初十',
		'十一','十二','十三','十四','十五','十六','十七','十八','十九','二十',
		'廿一','廿二','廿三','廿四','廿五','廿六','廿七','廿八','廿九','三十'];
	const HEAVENLY_STEMS = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
	const EARTHLY_BRANCHES = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
	const ZODIAC_ANIMALS = ['鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪'];

	/** 阳历 → 农历转换 */
	function solarToLunar(sY, sM, sD) {
		const baseMs = Date.UTC(1900, 0, 31); // 1900-01-31 = 农历庚子年正月初一
		const targetMs = Date.UTC(sY, sM - 1, sD);
		let offset = Math.floor((targetMs - baseMs) / 86400000);
		if (offset < 0) return { month: '', day: '', lunarYear: '' };

		// 定位农历年
		let lunarYear = 1900;
		let yearDays;
		for (; lunarYear < 2101 && offset > 0; lunarYear++) {
			yearDays = lunarYearDays(lunarYear);
			offset -= yearDays;
		}
		if (offset < 0) { offset += yearDays; lunarYear--; }

		// 定位农历月（逐月扣减，正确处理闰月）
		const leapMonth = getLeapMonth(lunarYear);
		let lunarMonth = 0;
		let isLeap = false;
		for (let m = 1; m <= 12; m++) {
			// 正常月
			let days = monthDayCount(lunarYear, m);
			if (offset < days) { lunarMonth = m; break; }
			offset -= days;
			// 该月之后有闰月且尚未处理
			if (m === leapMonth) {
				days = leapMonthDays(lunarYear);
				if (offset < days) { lunarMonth = m; isLeap = true; break; }
				offset -= days;
			}
		}
		if (lunarMonth === 0) { lunarMonth = 12; } // fallback

		const lunarDay = offset + 1;
		const mIdx = (lunarMonth - 1) % 12;
		const monthName = (isLeap ? '闰' : '') + LUNAR_MONTH_NAMES[mIdx] + '月';
		const dayName = LUNAR_DAY_NAMES[Math.min(lunarDay - 1, 29)];
		const stem = HEAVENLY_STEMS[(lunarYear - 4) % 10];
		const branch = EARTHLY_BRANCHES[(lunarYear - 4) % 12];
		const zodiac = ZODIAC_ANIMALS[(lunarYear - 4) % 12];

		return { month: monthName, day: dayName, isFirstDay: lunarDay === 1, lunarYear, stem, branch, zodiac };
	}

	function lunarYearDays(y) {
		let sum = 348;
		for (let i = 0x8000; i > 0x8; i >>= 1) sum += (LUNAR_INFO[y - 1900] & i) ? 1 : 0;
		return sum + leapMonthDays(y);
	}

	function getLeapMonth(y) {
		return LUNAR_INFO[y - 1900] & 0xf;
	}

	function leapMonthDays(y) {
		return getLeapMonth(y) ? ((LUNAR_INFO[y - 1900] & 0x10000) ? 30 : 29) : 0;
	}

	function monthDayCount(y, m) {
		return (LUNAR_INFO[y - 1900] & (0x10000 >> m)) ? 30 : 29;
	}

	/** 农历 → 公历转换 */
	function lunarToSolar(lY, lM, lD, isLeap) {
		const baseMs = Date.UTC(1900, 0, 31);
		let offset = 0;
		for (let y = 1900; y < lY; y++) offset += lunarYearDays(y);
		const leapMonth = getLeapMonth(lY);
		for (let m = 1; m < lM; m++) {
			offset += monthDayCount(lY, m);
			if (m === leapMonth) offset += leapMonthDays(lY);
		}
		if (isLeap && lM === leapMonth) {
			offset += monthDayCount(lY, lM);
		}
		offset += lD - 1;
		const result = new Date(baseMs + offset * 86400000);
		return { y: result.getUTCFullYear(), m: result.getUTCMonth() + 1, d: result.getUTCDate() };
	}

	/** 获取节日名称（公历+农历），无节日返回 null */
	function getHoliday(sY, sM, sD) {
		// 公历固定节日
		const SOLAR = {
			'1-1': '元旦', '2-14': '情人节', '3-8': '妇女节', '3-12': '植树节',
			'4-1': '愚人节', '5-1': '劳动节', '5-4': '青年节', '6-1': '儿童节',
			'7-1': '建党节', '8-1': '建军节', '9-10': '教师节', '10-1': '国庆节',
			'10-31': '万圣节', '12-24': '平安夜', '12-25': '圣诞节',
		};
		const solarKey = `${sM}-${sD}`;
		if (SOLAR[solarKey]) return SOLAR[solarKey];

		// 母亲节（5月第二个周日）& 父亲节（6月第三个周日）
		if (sM === 5) {
			const firstDay = new Date(sY, 4, 1).getDay();
			const secondSun = firstDay === 0 ? 8 : 15 - firstDay;
			if (sD === secondSun) return '母亲节';
		}
		if (sM === 6) {
			const firstDay = new Date(sY, 5, 1).getDay();
			const thirdSun = firstDay === 0 ? 15 : 22 - firstDay;
			if (sD === thirdSun) return '父亲节';
		}

		// 农历节日（用已有的 solarToLunar 结果判断）
		const lunar = solarToLunar(sY, sM, sD);
		if (!lunar || !lunar.month) return null;
		const lm = lunar.month, ld = lunar.day;
		// lunar.month/lunar.day 是字符串（"五月"/"初五"），需要转成数字比较
		const monthNum = LUNAR_MONTH_NAMES.indexOf(lm.replace('闰', '').replace('月', '')) + 1;
		const dayNum = LUNAR_DAY_NAMES.indexOf(ld) + 1;

		// 除夕：农历十二月最后一天（用前一天是否是正月初一来判断太复杂，直接用十二月三十或二十九）
		if (monthNum === 12 && dayNum === 30) return '除夕';
		if (monthNum === 12 && dayNum === 29) {
			// 如果十二月只有29天（小月），则29日就是除夕
			// 通过检查下一天是否是正月初一来判断（但更简单的是：如果三十不存在则二十九是除夕）
			// 简化处理：十二月二十九暂不标除夕（标了反而可能误标），留给用户自行判断
		}
		if (monthNum === 1 && dayNum === 1) return '春节';
		if (monthNum === 1 && dayNum === 15) return '元宵节';
		if (monthNum === 2 && dayNum === 2) return '龙抬头';
		if (monthNum === 5 && dayNum === 5) return '端午节';
		if (monthNum === 7 && dayNum === 7) return '七夕节';
		if (monthNum === 7 && dayNum === 15) return '中元节';
		if (monthNum === 8 && dayNum === 15) return '中秋节';
		if (monthNum === 9 && dayNum === 9) return '重阳节';
		if (monthNum === 12 && dayNum === 8) return '腊八节';
		if (monthNum === 12 && dayNum === 23) return '小年';

		return null;
	}

	const DEFAULT_SETTINGS = {
		enableBall: true,
		listMode: 'black',
		blacklist: [],
		whitelist: [],
		theme: 'glassLight',
		font: 'system',
		view: 'grid',
		sortBy: 'updatedDesc',
		autoCleanTitle: true,
		clickMode: 'single-main',
		defaultTab: 'records',
		ui: { ...DEFAULT_UI },
		ball: { ...DEFAULT_BALL },
		ballPos: { right: '16px', top: `calc(50vh - ${DEFAULT_BALL.size / 2}px)`, left: 'auto', bottom: 'auto' },
		hotkeys: { main: 'Shift+E', record: 'Shift+R', platforms: 'Shift+G', navlinks: 'Shift+D', notes: 'Shift+N', openRecords: '', timer: '' },
		dict: { statuses: [...DEFAULT_STATUSES], types: [...DEFAULT_TYPES] },
		enableReminder: true,
		cardStyle: 'classic',
		videoParsers: DEFAULT_VIDEO_PARSERS.map(p => ({ ...p })),
		videoDefaultParser: 0,
		videoPlayMode: 'newtab',
		videoAutoDetect: true,
		imgGrabMinSize: 100,
		imgGrabMinWidth: 0,
		imgGrabMinHeight: 0,
		imgGrabFormat: 'original',
		imgGrabSort: 'default',
		imgGrabPreviewSize: 'medium',
		imgGrabRename: '{PAGETITLE}_{NO}.{EXT}',
		imgGrabAutoSniff: false,
		weekStart: 0,
		tabOrder: ['records', 'platforms', 'navlinks', 'notes', 'calendar', 'timer', 'videoparse', 'imggrab'],
		enabledTabs: ['records', 'platforms', 'navlinks', 'notes', 'calendar', 'timer', 'imggrab'],
	};

	// ═══════════════════════════════════════════════════════
	//  STATE
	// ═══════════════════════════════════════════════════════
	let state = {
		shows: GM_getValue(KEY_DATA, []),
		settings: deepMerge(DEFAULT_SETTINGS, GM_getValue(KEY_SETTINGS, {})),
		platforms: GM_getValue(KEY_PLATFORMS, null) || [...DEFAULT_PLATFORMS],
		platformCategories: GM_getValue(KEY_PLATFORM_CATS, null) || [...DEFAULT_PLATFORM_CATEGORIES],
		navCategories: GM_getValue(KEY_NAV_CATS, null) || [...DEFAULT_NAV_CATEGORIES],
		navLinks: GM_getValue(KEY_NAV_LINKS, null) || [...DEFAULT_NAV_LINKS],
		navEngines: GM_getValue(KEY_NAV_ENGINES, null) || [...DEFAULT_NAV_ENGINES],
		navActiveEngine: 'bing',
		navActiveCategory: 'common',
		notes: GM_getValue(KEY_NOTES, []) || [],
		timer: deepMerge(DEFAULT_TIMER, GM_getValue(KEY_TIMER, {})),
		todos: GM_getValue(KEY_TODOS, {}) || {},
		marks: GM_getValue(KEY_MARKS, {}) || {},
	};
	ensureDefaults();

	function deepMerge(base, override) {
		if (!override || typeof override !== 'object') return { ...base };
		const result = { ...base };
		for (const k of Object.keys(base)) {
			if (k in override) {
				if (typeof base[k] === 'object' && !Array.isArray(base[k]) && base[k] !== null) {
					result[k] = deepMerge(base[k], override[k]);
				} else {
					result[k] = override[k];
				}
			}
		}
		for (const k of Object.keys(override || {})) {
			if (!(k in base)) result[k] = override[k];
		}
		return result;
	}

	function ensureDefaults() {
		const s = state.settings;
		if (!s.dict) s.dict = { ...DEFAULT_SETTINGS.dict };
		if (!Array.isArray(s.dict.statuses) || !s.dict.statuses.length) s.dict.statuses = [...DEFAULT_STATUSES];
		if (!Array.isArray(s.dict.types) || !s.dict.types.length) s.dict.types = DEFAULT_TYPES.map(t => ({ ...t }));
		// 迁移旧格式 string[] → {name, single}[]
		if (s.dict.types.length && typeof s.dict.types[0] === 'string') {
			const singleNames = ['电影', '纪录片', '短视频'];
			s.dict.types = s.dict.types.map(t => ({ name: t, single: singleNames.includes(t) }));
		}
		if (!s.ballPos) s.ballPos = { ...DEFAULT_SETTINGS.ballPos };
		if (!s.listMode) s.listMode = 'black';
		if (!Array.isArray(s.blacklist)) s.blacklist = [];
		if (!Array.isArray(s.whitelist)) s.whitelist = [];
		if (s.autoCleanTitle === undefined) s.autoCleanTitle = true;
		if (s.enableReminder === undefined) s.enableReminder = true;
		if (!s.clickMode) s.clickMode = 'single-main';
		s.ui = { ...DEFAULT_UI, ...(s.ui || {}) };
		s.ball = { ...DEFAULT_BALL, ...(s.ball || {}) };
		if (!s.ui.fontSize || s.ui.fontSize < 10 || s.ui.fontSize > 24) s.ui.fontSize = 16;
		if (!s.ball.size || s.ball.size < 30 || s.ball.size > 60) s.ball.size = 42;
		if (s.ball.bgOpacity === undefined || s.ball.bgOpacity < 0 || s.ball.bgOpacity > 1) s.ball.bgOpacity = 1.0;
		if (!s.font || !FONTS[s.font]) s.font = 'system';
		if (!s.hotkeys) s.hotkeys = { main: 'Shift+E', record: 'Shift+R', platforms: 'Shift+G' };
		if (!s.hotkeys.platforms) s.hotkeys.platforms = 'Shift+G';
		if (s.hotkeys.openRecords === undefined) s.hotkeys.openRecords = '';
		if (!s.theme || !THEMES[s.theme]) s.theme = 'glassLight';
		if (!s.cardStyle || !['classic', 'immersive'].includes(s.cardStyle)) s.cardStyle = 'classic';
		if (!Array.isArray(s.tabOrder) || !s.tabOrder.length) s.tabOrder = ['records', 'platforms', 'navlinks', 'notes', 'calendar', 'timer'];
		if (!Array.isArray(s.enabledTabs) || !s.enabledTabs.length) s.enabledTabs = [...s.tabOrder];
		// 确保新 tab 对已有设置也生效
		if (!s.tabOrder.includes('timer')) s.tabOrder.push('timer');
		if (!s.enabledTabs.includes('timer')) s.enabledTabs.push('timer');
		if (!s.tabOrder.includes('calendar')) s.tabOrder.push('calendar');
		if (!s.enabledTabs.includes('calendar')) s.enabledTabs.push('calendar');
		if (!s.tabOrder.includes('videoparse')) s.tabOrder.push('videoparse');
		if (!s.tabOrder.includes('imggrab')) s.tabOrder.push('imggrab');
		if (!s.enabledTabs.includes('imggrab')) s.enabledTabs.push('imggrab');
		if (!Array.isArray(s.videoParsers) || !s.videoParsers.length) s.videoParsers = DEFAULT_VIDEO_PARSERS.map(p => ({ ...p }));
		if (s.videoDefaultParser === undefined || s.videoDefaultParser < 0) s.videoDefaultParser = 0;
		if (!s.videoPlayMode) s.videoPlayMode = 'newtab';
		if (s.videoAutoDetect === undefined) s.videoAutoDetect = true;
		if (s.weekStart === undefined) s.weekStart = 0;
		// 去重保护
		s.tabOrder = [...new Set(s.tabOrder)];
		s.enabledTabs = [...new Set(s.enabledTabs)];

		// 计时器状态恢复
		if (!state.timer) state.timer = deepMerge(DEFAULT_TIMER, {});
		const t = state.timer;
		if (!t.countdown) t.countdown = { ...DEFAULT_TIMER.countdown };
		if (!t.stopwatch) t.stopwatch = { ...DEFAULT_TIMER.stopwatch };
		if (!t.pomodoro) t.pomodoro = { ...DEFAULT_TIMER.pomodoro };
		if (!Array.isArray(t.pomodoro.totalHistory)) t.pomodoro.totalHistory = [];
		// 自动恢复：若倒计时/番茄钟目标时间已过，标记为未运行
		const now = Date.now();
		if (t.countdown.targetTs > 0 && t.countdown.targetTs <= now) t.countdown.targetTs = 0;
		if (t.pomodoro.running && t.pomodoro.targetTs > 0 && t.pomodoro.targetTs <= now) { t.pomodoro.running = false; t.pomodoro.targetTs = 0; }
		// 番茄钟今日统计重置
		const today = new Date().toISOString().slice(0, 10);
		if (t.pomodoro.todayDate !== today) {
			if (t.pomodoro.todayDate && t.pomodoro.todayCount > 0) {
				t.pomodoro.totalHistory.push({ date: t.pomodoro.todayDate, count: t.pomodoro.todayCount });
				if (t.pomodoro.totalHistory.length > 30) t.pomodoro.totalHistory = t.pomodoro.totalHistory.slice(-30);
			}
			t.pomodoro.todayCount = 0;
			t.pomodoro.todayDate = today;
		}

		state.shows.forEach(show => {
			if (!Array.isArray(show.links)) show.links = [];
			show.links.forEach(link => { if (link.episode === undefined) link.episode = link.currentEpisode || 0; });
			sortLinks(show.links);
			if (!show.schedule) show.schedule = 'unset';
			if (!Array.isArray(show.history)) show.history = [];
		});
		if (!Array.isArray(state.platforms)) state.platforms = [...DEFAULT_PLATFORMS];
		if (!Array.isArray(state.platformCategories) || !state.platformCategories.length) {
			state.platformCategories = [...DEFAULT_PLATFORM_CATEGORIES];
		}
	}

	function sortLinks(links) {
		links.sort((a, b) => (b.episode || 0) - (a.episode || 0));
	}

	/** 获取置顶链接（优先 pinnedLinkIdx，否则 links[0]） */
	function getBestLink(show) {
		if (!show.links?.length) return null;
		const idx = show.pinnedLinkIdx;
		if (idx >= 0 && idx < show.links.length) return show.links[idx];
		return show.links[0];
	}

	// 动画延迟常量（ms）
	const ANIM_DELAY_CARD_GRID = 22;
	const ANIM_DELAY_CARD_LIST = 16;
	const ANIM_DELAY_PLATFORM = 20;

	/** 检测触屏设备（iPad / 手机） */
	const isTouchDevice = ('ontouchstart' in window) && navigator.maxTouchPoints > 0;

	/** HTML 转义，防止 XSS */
	function escapeHTML(str) {
		if (!str) return '';
		return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
	}

	/** 协议切换输入组件工厂：左侧按钮切换 https/http，右侧 input 仅显示主机+路径 */
	function createProtocolInput(inputEl, defaultProto) {
		const PROTOCOLS = ['https://', 'http://'];
		let protocol = defaultProto || 'https://';

		const btn = document.createElement('button');
		btn.type = 'button';
		btn.className = 'proto-switch';
		btn.textContent = protocol;
		btn.title = '点击切换协议';

		const wrap = document.createElement('div');
		wrap.className = 'proto-input-wrap';
		inputEl.parentNode.insertBefore(wrap, inputEl);
		wrap.appendChild(btn);
		wrap.appendChild(inputEl);

		const initVal = inputEl.value.trim();
		if (/^https?:\/\//i.test(initVal)) {
			protocol = initVal.slice(0, initVal.indexOf('//') + 2).toLowerCase();
			btn.textContent = protocol;
			inputEl.value = initVal.slice(protocol.length);
		}

		btn.addEventListener('click', () => {
			const idx = PROTOCOLS.indexOf(protocol);
			protocol = PROTOCOLS[(idx + 1) % PROTOCOLS.length];
			btn.textContent = protocol;
		});

		inputEl.addEventListener('paste', () => {
			setTimeout(() => {
				const val = inputEl.value.trim();
				if (/^https?:\/\//i.test(val)) {
					const matched = val.match(/^(https?:\/\/)/i);
					protocol = matched[1].toLowerCase();
					btn.textContent = protocol;
					inputEl.value = val.slice(protocol.length);
				}
			}, 0);
		});

		return {
			get input() { return inputEl; },
			get button() { return btn; },
			getValue() { return protocol + inputEl.value.trim(); },
			setValue(url) {
				if (/^https?:\/\//i.test(url)) {
					const matched = url.match(/^(https?:\/\/)/i);
					protocol = matched[1].toLowerCase();
					btn.textContent = protocol;
					inputEl.value = url.slice(protocol.length);
				} else {
					inputEl.value = url;
				}
			},
		};
	}

	/** 防抖函数 */
	function debounce(fn, delay) {
		let timer;
		return function (...args) { clearTimeout(timer); timer = setTimeout(() => fn.apply(this, args), delay); };
	}

	/** 搜索关键词高亮 */
	function highlightText(text, keyword) {
		if (!keyword) return escapeHTML(text);
		const escaped = escapeHTML(text);
		const kw = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		return escaped.replace(new RegExp('(' + kw + ')', 'gi'), '<mark class="search-hl">$1</mark>');
	}

	/** 获取最近更新时间戳 */
	function getLastUpdatedTime() {
		return state.shows.reduce((max, s) => Math.max(max, s.updatedAt || 0), 0);
	}

	/** 格式化最近更新时间文本 */
	function formatLastUpdated() {
		const ts = getLastUpdatedTime();
		return ts ? `最近更新：${new Date(ts).toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}` : '';
	}

	/** 构建导出/备份数据结构 */
	function buildDump(opts) {
		if (opts === true) opts = { settings: true, shows: true, platforms: true, nav: true, notes: true };
		opts = opts || { settings: true, shows: true, platforms: true, nav: true, notes: true };
		const dump = { _version: VERSION, _date: new Date().toISOString() };
		if (opts.settings) dump.settings = state.settings;
		if (opts.shows) dump.shows = state.shows;
		if (opts.platforms) { dump.platforms = state.platforms; dump.platformCategories = state.platformCategories; }
		if (opts.nav) { dump.navCategories = state.navCategories; dump.navLinks = state.navLinks; dump.navEngines = state.navEngines; }
		if (opts.notes) dump.notes = state.notes;
		if (opts.timer) dump.timer = state.timer;
		if (opts.todos) dump.todos = state.todos;
		if (opts.marks) dump.marks = state.marks;
		return dump;
	}

	/** 检查追剧更新提醒 */
	function checkScheduleReminders() {
		if (!state.settings.enableReminder) return;
		const now = new Date();
		const dayMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
		const today = dayMap[now.getDay()];
		const todayStr = now.toDateString();

		let changed = false;
		state.shows.forEach(show => {
			if (show.status !== 'watching') return;
			if (!show.schedule || show.schedule === 'unset' || show.schedule === 'finished') return;
			const shouldRemind = show.schedule === 'daily' || show.schedule === today;
			if (!shouldRemind) return;
			if (new Date(show._lastReminded || 0).toDateString() === todayStr) return;

			try {
				GM_notification({
					title: '追剧提醒',
					text: `《${show.name}》今天更新！当前看到第${show.currentEpisode}集`,
					url: show.links?.[0]?.url || '',
					timeout: 10000,
				});
			} catch { /* GM_notification 可能不可用 */ }
			show._lastReminded = Date.now();
			changed = true;
		});
		if (changed) saveData();
	}

	/** 从封面候选中自动选择最佳封面 */
	function selectBestCover(candidates) {
		const priority = ['og:image', 'twitter:image', '视频封面', '页面大图'];
		for (const label of priority) {
			const found = candidates.find(c => c.label === label && !c.isGenerated);
			if (found) return found.url;
		}
		return null;
	}

	// ── API 刮削（Bangumi） ──
	const BANGUMI_API = 'https://api.bgm.tv';

	/** 搜索 Bangumi 影视元数据 */
	async function searchBangumi(keyword) {
		try {
			const resp = await new Promise((resolve, reject) => {
				GM.xmlHttpRequest({
					method: 'GET',
					url: `${BANGUMI_API}/search/subject/${encodeURIComponent(keyword)}?responseGroup=small&max_results=8`,
					headers: { 'Accept': 'application/json' },
					onload: (r) => {
						if (r.status >= 200 && r.status < 300) resolve(JSON.parse(r.responseText));
						else reject(new Error(`HTTP ${r.status}`));
					},
					onerror: () => reject(new Error('网络错误')),
					ontimeout: () => reject(new Error('请求超时')),
				});
			});
			const bangumiTypeMap = { 2: '动漫', 6: '日韩剧' };
			return (resp.list || []).map(item => {
				const coverUrl = item.images?.large || item.images?.common || '';
				return {
					id: item.id,
					name: item.name_cn || item.name,
					nameOriginal: item.name,
					cover: coverUrl ? coverUrl.replace(/^http:\/\//, 'https://') : '',
					date: item.date || '',
					summary: (item.summary || '').slice(0, 120),
					rating: item.rating?.score || 0,
					type: bangumiTypeMap[item.type] || '',
				};
			});
		} catch (err) {
			console.error('[Bangumi] 搜索失败:', err);
			return [];
		}
	}

	/** 获取 Bangumi 条目详情（含集数、更新周期） */
	async function getBangumiDetail(id) {
		try {
			const resp = await new Promise((resolve, reject) => {
				GM.xmlHttpRequest({
					method: 'GET',
					url: `${BANGUMI_API}/subject/${id}?responseGroup=medium`,
					headers: { 'Accept': 'application/json' },
					onload: (r) => {
						if (r.status >= 200 && r.status < 300) resolve(JSON.parse(r.responseText));
						else reject(new Error(`HTTP ${r.status}`));
					},
					onerror: () => reject(new Error('网络错误')),
					ontimeout: () => reject(new Error('请求超时')),
				});
			});
			const weekdayMap = { 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat', 7: 'Sun' };
			return {
				eps: resp.eps_count || resp.eps || null,
				schedule: resp.air_weekday ? (weekdayMap[resp.air_weekday] || '') : '',
				summary: (resp.summary || '').slice(0, 200),
				rating: resp.rating?.score || 0,
			};
		} catch { return null; }
	}

	// ═══════════════════════════════════════════════════════
	//  ICONS
	// ═══════════════════════════════════════════════════════
	const I = {
		film: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></svg>`,
		play: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>`,
		edit: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
		trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
		gear: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
		x: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
		plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
		upload: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`,
		download: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
		grid: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>`,
		rows: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`,
		search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
		star: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
		zap: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
		eye: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
		sun: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`,
		moon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
		sliders: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>`,
		check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
		help: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
		tag: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>`,
		undo: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.5"/></svg>`,
		extLink: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`,
		filter: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>`,
		image: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`,
		cardToggle: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="8" height="18" rx="1.5"/><rect x="13" y="3" width="9" height="8" rx="1.5"/><rect x="13" y="14" width="9" height="7" rx="1.5"/></svg>`,
		cloudUpload: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 12v9"/><polyline points="8 16 12 12 16 16"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>`,
		cloudDownload: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 12v9"/><polyline points="16 17 12 21 8 17"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>`,
		eyeOff: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`,
		swap: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>`,
		pin: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>`,
		status: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
		compass: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>`,
	};

	// ═══════════════════════════════════════════════════════
	//  CSS BUILDER
	// ═══════════════════════════════════════════════════════
	function buildCSS(th, fontKey, ui) {
		const f = FONTS[fontKey] || FONTS.system;
		const fontImport = f.url ? `@import url('${f.url}');` : '';
		const textOnAccent = th.dark ? '#000' : '#fff';
		const fontSize = ui.fontSize || 16;
		return `
			${fontImport}

			:host {
				--bg:               ${th.bg};
				--surface:          ${th.surface};
				--surface-hi:       ${th.surfaceHigh};
				--border:           ${th.border};
				--text:             ${th.text};
				--muted:            ${th.muted};
				--accent:           ${th.accent};
				--accent-dim:       ${th.accentDim};
				--accent-text:      ${textOnAccent};
				--radius-sm:        ${ui.radiusSm}px;
				--radius:           ${Math.max(4, ui.radius - 4)}px;
				--radius-lg:        ${ui.radius}px;
				--platform-icon-r:  ${ui.platformIconRadius || 8}px;
				--panel-main-w:     ${ui.mainWidth}px;
				--panel-edit-w:     ${ui.editWidth}px;
				--panel-settings-w: ${ui.settingsWidth}px;
				--panel-main-h-min: ${ui.mainHeightAuto ? '0px' : (ui.mainHeightMin || 400) + 'px'};
				--panel-main-h-max: ${(ui.mainHeightMax || 700)}px;
				--panel-opacity:    ${ui.opacity};
				--overlay-blur:     ${ui.blur}px;
				--font-size:        ${fontSize}px;
				--shadow-sm:        0 2px 8px rgba(0,0,0,0.08);
				--shadow-md:        0 4px 16px rgba(0,0,0,0.12);
				--shadow-lg:        0 8px 32px rgba(0,0,0,0.16);
				font-family: ${f.family};
				font-size: var(--font-size);
			}

			*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

			::-webkit-scrollbar { width: 4px; height: 4px; }
			::-webkit-scrollbar-track { background: transparent; }
			::-webkit-scrollbar-thumb { background: var(--border); border-radius: 99px; }
			::-webkit-scrollbar-thumb:hover { background: var(--muted); }

			.overlay {
				position: fixed; inset: 0; z-index: 9990;
				display: flex; align-items: center; justify-content: center;
				background: rgba(0,0,0,${th.dark ? '0.65' : '0.35'});
				
				opacity: 0; pointer-events: none;
				transition: opacity 0.25s ease;
			}
			.overlay.open { opacity: 1; pointer-events: auto; }

			.panel {
				background: color-mix(in srgb, var(--bg) calc(var(--panel-opacity) * 100%), transparent);
				border: 1px solid var(--border);
				border-radius: var(--radius-lg);
				box-shadow: var(--shadow-lg);
				display: flex; flex-direction: column;
				overflow: hidden;
				min-height: var(--panel-main-h-min);
				max-height: var(--panel-main-h-max);
				width: min(var(--panel-main-w), 95vw);
				transform: translateY(16px) scale(0.98);
				transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
				backdrop-filter: blur(var(--overlay-blur));
			}

			/* 设置面板保持固定高度 */
			.panel.settings-panel {
				min-height: 60vh;
				max-height: 60vh;
			}
			.overlay.open .panel { transform: translateY(0) scale(1); }
			.panel.edit-panel { width: min(var(--panel-edit-w), 95vw); min-height: 0; }
			.panel.settings-panel { width: min(var(--panel-settings-w), 95vw); }

			.panel-head {
				padding: 14px 18px;
				border-bottom: 1px solid var(--border);
				display: flex; align-items: center; gap: 8px;
				background: color-mix(in srgb, var(--surface) calc(var(--panel-opacity) * 100%), transparent);
				flex-shrink: 0;
			}
			.panel-head h2 { font-size: calc(var(--font-size) * 1.0); font-weight: 600; color: var(--text); letter-spacing: -0.02em; flex: 1; }
			.head-logo {
				width: 30px; height: 30px; color: var(--accent);
				background: var(--accent-dim); border-radius: var(--radius-sm);
				display: flex; align-items: center; justify-content: center; flex-shrink: 0;
			}
			.head-logo svg { width: 16px; height: 16px; }
			.panel-body { flex: 1; overflow-y: auto; padding: 14px 18px; overscroll-behavior: contain; }
			.main-panel > .panel-body { display: flex; flex-direction: column; overflow: hidden; padding: 0; }
			.panel-foot {
				padding: 10px 18px; border-top: 1px solid var(--border);
				background: color-mix(in srgb, var(--surface) calc(var(--panel-opacity) * 100%), transparent);
				display: flex; align-items: center; gap: 8px; flex-shrink: 0;
			}

			.tabs { display: flex; border-bottom: 1px solid var(--border); flex-shrink: 0; padding: 0 18px; background: var(--surface); }
			.tab-btn {
				padding: 7px 14px; font-size: calc(var(--font-size) * 0.857);
				font-weight: 500; background: transparent; border: none; color: var(--muted);
				cursor: pointer; font-family: inherit; transition: color 0.15s;
				border-bottom: 2px solid transparent; margin-bottom: -1px;
			}
			.tab-btn:hover { color: var(--text); }
			.tab-btn.active { color: var(--accent); border-bottom-color: var(--accent); }
			.tab-content { display: none; }
			.tab-content.active { display: flex; flex-direction: column; flex: 1; overflow-y: auto; padding: 14px 18px; min-height: 0; }

			.btn {
				display: inline-flex; align-items: center; gap: 5px;
				padding: 6px 12px; border-radius: var(--radius-sm);
				font-size: calc(var(--font-size) * 0.857); font-weight: 500; cursor: pointer;
				border: none; transition: all 0.15s; font-family: inherit; white-space: nowrap;
				box-shadow: var(--shadow-sm);
			}
			.btn svg { width: 13px; height: 13px; flex-shrink: 0; }
			.btn-primary {
				background: linear-gradient(135deg, var(--accent) 0%, color-mix(in srgb, var(--accent) 70%, #fff) 100%);
				color: var(--accent-text);
				box-shadow: 0 0 14px var(--accent-dim), var(--shadow-sm);
			}
			.btn-primary:hover { filter: brightness(1.08); transform: translateY(-1px); }
			.btn-primary.cloud-btn {
				background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
				color: #fff;
				box-shadow: 0 0 10px rgba(0,242,254,0.3);
			}
			.btn-ghost { background: var(--surface); color: var(--muted); border: 1.0px solid color-mix(in srgb, var(--border) 60%, var(--muted)); box-shadow: none; }
			.btn-ghost:hover { color: var(--text); border-color: var(--muted); background: var(--surface-hi); }
			.btn-icon {
				padding: 8px; background: transparent;
				border: 1.0px solid color-mix(in srgb, var(--border) 60%, var(--muted)); color: var(--muted);
				border-radius: var(--radius-sm); cursor: pointer;
				display: inline-flex; align-items: center; justify-content: center;
				transition: all 0.15s; font-family: inherit; box-shadow: none;
			}
			.btn-icon:hover { color: var(--accent); border-color: var(--accent); background: var(--accent-dim); }
			.btn-icon.active { color: var(--accent); border-color: var(--accent); background: var(--accent-dim); }
			.btn-icon svg { width: 15px; height: 15px; display: block; }
			.btn-inc {
				padding: 4px 7px; background: var(--accent-dim); color: var(--accent);
				border: 1px solid var(--accent); border-radius: var(--radius-sm); cursor: pointer;
				display: inline-flex; align-items: center; gap: 2px;
				font-size: calc(var(--font-size) * 0.714); font-weight: 700; font-family: inherit;
				transition: all 0.15s; white-space: nowrap; line-height: 1;
			}
			.btn-inc:hover { background: var(--accent); color: var(--accent-text); }
			.btn-inc svg { width: 10px; height: 10px; }
			.accent-btn { color: var(--accent); border-color: var(--accent); background: var(--accent-dim); }
			.accent-btn:hover { background: var(--accent); color: var(--accent-text); }
			.accent-btn:active { filter: brightness(0.9); transform: translateY(1px); }
			.btn-danger { background: rgba(239,68,68,0.1); color: #f87171; border: 1px solid rgba(239,68,68,0.2); }
			.btn-danger:hover { background: rgba(239,68,68,0.2); }
			.ml-auto { margin-left: auto; }

			input[type="text"], input[type="number"], input[type="search"], input[type="password"], select, textarea {
				background: var(--surface-hi) 85%; border: 1px solid var(--border);
				color: var(--text); padding: 7px 9px; border-radius: var(--radius-sm);
				font-size: calc(var(--font-size) * 0.857); font-family: inherit; outline: none; width: 100%;
				transition: border-color 0.15s, box-shadow 0.15s;
			}
			input:focus, select:focus, textarea:focus {
				border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-dim);
			}
			select option { background: var(--surface); color: var(--text); }
			textarea { resize: vertical; min-height: 56px; line-height: 1.5; }
			input[type="range"] {
				flex: 1; accent-color: var(--accent); background: transparent;
				border: none; box-shadow: none; padding: 0; cursor: pointer; height: 20px;
			}
			input[type="range"]:focus { box-shadow: none; }
			input[type="checkbox"] { width: 14px; height: 14px; accent-color: var(--accent); cursor: pointer; }
			input[type="color"] { width: 32px; height: 28px; padding: 2px; cursor: pointer; border-radius: var(--radius-sm); }
			input[type="radio"] { accent-color: var(--accent); cursor: pointer; margin-right: 4px; }

			.proto-input-wrap { display: flex; align-items: stretch; }
			.proto-input-wrap input { border-top-left-radius: 0; border-bottom-left-radius: 0; }
			.proto-switch {
				flex-shrink: 0; display: flex; align-items: center; padding: 0 8px;
				background: var(--surface-hi); border: 1px solid var(--border);
				border-right: none; border-radius: var(--radius-sm) 0 0 var(--radius-sm);
				color: var(--accent); font-size: calc(var(--font-size) * 0.786);
				font-weight: 700; font-family: inherit; cursor: pointer;
				white-space: nowrap; transition: background 0.15s;
			}
			.proto-switch:hover { background: var(--accent-dim); }

			.form-row { display: flex; gap: 10px; }
			.form-row > * { flex: 1; min-width: 0; }
			.form-group { display: flex; flex-direction: column; gap: 4px; margin-bottom: 10px; }
			.form-label { font-size: calc(var(--font-size) * 0.714); font-weight: 600; color: var(--muted); letter-spacing: 0.06em; text-transform: uppercase; }
			.form-label.required::after { content: ' *'; color: #f87171; font-weight: bold; }

			.toolbar { display: flex; gap: 5px; align-items: center; margin-bottom: 10px; flex-wrap: wrap; width: 100%; flex-shrink: 0; }
			.search-wrap { position: relative; flex: 1; min-width: 110px; max-width: none; }
			.search-wrap svg { position: absolute; left: 7px; top: 50%; transform: translateY(-50%); width: 12px; height: 12px; color: var(--muted); pointer-events: none; }
			.search-wrap input { padding-left: 26px; font-size: calc(var(--font-size) * 0.857); }
			.filter-select { width: auto; min-width: 76px; font-size: calc(var(--font-size) * 0.786); padding: 6px 7px; flex-shrink: 0; }
			.toolbar-sep { flex: 0; }

			.platform-toolbar { display: flex; gap: 6px; align-items: center; margin-bottom: 12px; flex-wrap: wrap; overflow-x: auto;}
			.platform-actions-bar {
				display: flex;
				gap: 6px;
				justify-content: flex-end;
				margin-bottom: 10px;
				flex-wrap: wrap;
				width: 100%; flex-shrink: 0;
			}

			.platform-search-wrap { position: relative; flex: 1 1 auto; min-width: 120px; max-width: 100%; }
			.platform-search-wrap svg { position: absolute; left: 8px; top: 50%; transform: translateY(-50%); width: 12px; height: 12px; color: var(--muted); pointer-events: none; }
			.platform-search-wrap input { padding-left: 28px; font-size: calc(var(--font-size) * 0.857); }
			.plat-filter-btn {
				padding: 6px 11px; border-radius: var(--radius-sm); font-size: calc(var(--font-size) * 0.786); font-weight: 500;
				background: var(--surface); border: 1px solid var(--border); color: var(--muted);
				cursor: pointer; transition: all 0.15s; white-space: nowrap; font-family: inherit;flex-shrink: 0;
			}
			.plat-filter-btn:hover { color: var(--text); border-color: var(--muted); }
			.plat-filter-btn.active { background: var(--accent-dim); border-color: var(--accent); color: var(--accent); }
			.plat-count-badge {
				font-size: calc(var(--font-size) * 0.714); background: var(--surface-hi); border: 1px solid var(--border);
				border-radius: 99px; padding: 1px 6px; color: var(--muted); align-self: center;
			}

			.stats-bar {
				display: flex; gap: 1px; margin-bottom: 10px;
				background: var(--border); border-radius: var(--radius-sm);
				overflow: hidden; border: 1px solid var(--border);
				width: 100%; flex-shrink: 0;
			}
			.stat-item {
				display: flex; flex-direction: column; align-items: center; gap: 2px;
				flex: 1; padding: 8px 5px;
				background: var(--surface); transition: background 0.15s; cursor: default;
			}
			.stat-item:hover { background: var(--surface-hi); }
			.stat-num { font-size: calc(var(--font-size) * 1.07); font-weight: 700; color: var(--text); }
			.stat-label { font-size: calc(var(--font-size) * 0.714); color: var(--muted); }
			.stat-dot { width: 5px; height: 5px; border-radius: 50%; margin-bottom: 1px; }

			.shows-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(152px, 1fr)); gap: 10px; }

			/* ── 卡片公共 ── */
			.show-card {
				background: var(--surface); border: 1px solid var(--border);
				border-radius: var(--radius); position: relative;
				overflow: hidden; cursor: pointer;
				transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
				box-shadow: var(--shadow-sm);
			}
			.show-card:hover {
				transform: translateY(-4px);
				box-shadow: var(--shadow-md), 0 0 0 1px var(--accent);
			}

			/* ── 经典卡片 (.card-classic) ── */
			.show-card.card-classic .card-cover-wrap {
				position: relative; width: 100%; aspect-ratio: 16 / 9; overflow: hidden; background: var(--surface-hi);
			}
			.show-card.card-classic .card-cover-wrap img,
			.show-card.card-classic .card-cover-wrap canvas { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
			.show-card.card-classic .card-status-pill {
				position: absolute; top: 5px; left: 5px; padding: 2px 6px; border-radius: 99px;
				font-size: calc(var(--font-size) * 0.643); font-weight: 600;
				backdrop-filter: blur(8px); background: rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.1);
			}
			.show-card.card-classic .card-ep-badge {
				position: absolute; bottom: 5px; right: 5px;
				background: rgba(0,0,0,0.72); color: #fff; padding: 2px 5px; border-radius: 4px;
				font-size: calc(var(--font-size) * 0.643); font-weight: 600;
			}
			.show-card.card-classic .card-inner { padding: 8px 9px 9px; }
			.show-card.card-classic .card-title {
				font-size: calc(var(--font-size) * 0.857); font-weight: 600; color: var(--text);
				white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 4px;
			}
			.show-card.card-classic .card-sub { font-size: calc(var(--font-size) * 0.714); color: var(--muted); margin-bottom: 5px; }
			.show-card.card-classic .card-rating { display: flex; align-items: center; gap: 1px; margin-bottom: 6px; font-size: calc(var(--font-size) * 0.786); color: #fbbf24; }
			.show-card.card-classic .card-progress { height: 3px; background: var(--surface-hi); border-radius: 99px; overflow: hidden; margin-bottom: 8px; }
			.show-card.card-classic .card-progress-bar { height: 100%; border-radius: 99px; }
			.show-card.card-classic .card-actions {
				display: flex; gap: 3px; margin-top: 0;
			}
			.show-card.card-classic .card-actions .btn-icon { flex: 1; justify-content: center; }
			.show-card.card-classic:hover {
				transform: scale(1.03);
				box-shadow: var(--shadow-lg), 0 0 0 1px var(--accent);
			}

			/* ── 沉浸卡片 (.card-immersive) ── */
			.show-card.card-immersive { aspect-ratio: 2 / 3; }
			.show-card.card-immersive .card-cover-wrap {
				position: absolute; inset: 0; width: 100%; height: 100%;
				background: var(--surface-hi);
			}
			.show-card.card-immersive .card-cover-wrap img,
			.show-card.card-immersive .card-cover-wrap canvas {
				width: 100%; height: 100%; object-fit: cover;
				transition: transform 0.4s ease;
			}
			.show-card.card-immersive:hover .card-cover-wrap img {
				transform: scale(1.08);
			}
			/* 覆盖层固定在底部，默认显示缩略信息 */
			.show-card.card-immersive .card-overlay {
				position: absolute; bottom: 0; left: 0; right: 0;
				padding: 24px 10px 10px 10px;
				background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 60%, transparent 100%);
				color: #fff;
				transition: padding 0.25s ease, background 0.25s ease;
				display: flex;
				flex-direction: column;
				justify-content: flex-end;
			}
			/* 详情区域默认隐藏，悬停时向上展开 */
			.show-card.card-immersive .card-detail {
				max-height: 0;
				opacity: 0;
				overflow: hidden;
				margin-bottom: 0;
				transition: max-height 0.3s ease, opacity 0.3s ease, margin-bottom 0.3s ease;
			}
			.show-card.card-immersive:hover .card-overlay {
				padding-bottom: 14px;
				background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 60%, transparent 100%);
			}
			.show-card.card-immersive:hover .card-detail {
				max-height: 100px;
				opacity: 1;
				margin-bottom: 8px;
			}
			/* 标题和副标题样式 */
			.show-card.card-immersive .card-title {
				font-size: calc(var(--font-size) * 0.9);
				font-weight: 700;
				color: #fff;
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
				margin-bottom: 3px;
				user-select: none;
				z-index: 2;
			}
			.show-card.card-immersive .card-sub {
				font-size: calc(var(--font-size) * 0.7); 
				color: rgba(255,255,255,0.75);
				margin-bottom: 0;
			}
			/* 评分与按钮 */
			.show-card.card-immersive .card-rating {
				display: flex;
				align-items: center;
				gap: 2px;
				margin-bottom: 6px;
				font-size: calc(var(--font-size) * 0.75);
				color: #fbbf24;
			}
			.show-card.card-immersive .card-actions {
				display: flex;
				gap: 4px;
			}
			.show-card.card-immersive .card-actions .btn-icon {
				flex: 1;
				justify-content: center;
				padding: 4px 0;
				border: 1px solid rgba(255,255,255,0.25);
				color: rgba(255,255,255,0.75);
				background: rgba(255,255,255,0.08);
				border-radius: 6px;
				backdrop-filter: blur(4px);
				transition: all 0.15s;
			}
			.show-card.card-immersive .card-actions .accent-btn {
				color: var(--accent);
				border-color: var(--accent);
				background: rgba(255,255,255,0.12);
			}
			.show-card.card-immersive .card-actions .accent-btn:hover {
				background: var(--accent);
				border-color: var(--accent);
				color: var(--accent-text);
			}
			.show-card.card-immersive .card-actions .btn-icon:hover {
				background: rgba(255,255,255,0.2);
				border-color: rgba(255,255,255,0.5);
				color: #fff;
			}
			/* 状态标签（保持在卡片左上角） */
			.show-card.card-immersive .card-status-pill {
				position: absolute;
				top: 8px;
				left: 8px;
				padding: 2px 8px;
				border-radius: 99px;
				font-size: calc(var(--font-size) * 0.8);
				font-weight: 600;
				backdrop-filter: blur(8px);
				background: rgba(0, 0, 0, 0.6);
				border: 1px solid rgba(255, 255, 255, 0.15);
				z-index: 2;
			}
			.show-card.card-immersive .card-overlay {
				position: absolute;
			}

			.shows-list { display: flex; flex-direction: column; gap: 5px; }
			.list-row {
				display: flex; align-items: center; gap: 9px;
				background: var(--surface); border: 1px solid var(--border);
				border-radius: var(--radius-sm); padding: 7px 11px;
				transition: all 0.15s; cursor: pointer; animation: cardIn 0.2s ease both;
			}
			.list-row:hover { border-color: var(--accent); background: var(--surface-hi); box-shadow: var(--shadow-sm); }
			.shows-list .list-row:nth-child(even) {
				background: color-mix(in srgb, var(--surface-hi) 60%, var(--surface));
			}
			.list-thumb { width: 42px; height: 26px; border-radius: 4px; object-fit: cover; flex-shrink: 0; background: var(--surface-hi); }
			.list-thumb-cv { width: 42px; height: 26px; border-radius: 4px; flex-shrink: 0; }
			.list-name { font-size: calc(var(--font-size) * 0.857); font-weight: 500; color: var(--text); flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
			.list-meta { display: flex; align-items: center; gap: 7px; flex-shrink: 0; }
			.list-ep { font-size: calc(var(--font-size) * 0.786); color: var(--muted); }
			.list-prog { width: 60px; display: flex; align-items: center; justify-content: center; }
			.list-rating { display: flex; align-items: center; gap: 1px; flex-shrink: 0; }
			.list-actions { display: flex; gap: 3px; flex-shrink: 0; }
			/* 进度环 */
			.list-ring {
				width: 28px; height: 28px;
			}
			.list-ring circle {
				transition: stroke-dasharray 0.3s ease;
			}

			.status-badge {
				display: inline-flex; align-items: center; gap: 3px;
				padding: 2px 6px; border-radius: 99px; font-size: calc(var(--font-size) * 0.714); font-weight: 600;
				border: 1px solid transparent;
			}
			.status-badge::before { content: ''; width: 4px; height: 4px; border-radius: 50%; background: currentColor; }

			.rating { display: flex; gap: 2px; }
			.star { cursor: pointer; color: var(--muted); transition: color 0.1s, transform 0.1s; }
			.star:hover, .star.on { color: #fbbf24; }
			.star:hover { transform: scale(1.2); }
			.star svg { width: 13px; height: 13px; }

			.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 24px; gap: 7px; text-align: center; }
			.empty-icon { color: var(--accent); opacity: 0.3; }
			.empty-icon svg { width: 38px; height: 38px; }
			.empty-title { font-size: calc(var(--font-size) * 0.929); font-weight: 600; color: var(--text); }
			.empty-sub { font-size: calc(var(--font-size) * 0.786); color: var(--muted); }

			.ball-host { position: fixed; z-index: 9980; display: flex; flex-direction: column; align-items: flex-end; gap: 6px; margin: 0; padding: 0; }
			#cine-ctrl { display: none; }
			#cine-ctrl.overlay-active ~ .ball-host { display: none !important; }
			.ball {
				border-radius: 50%;
				box-shadow: inset 0 0 0 1px rgba(255,255,255,0.06), var(--shadow-md);
				cursor: pointer;
				display: flex; align-items: center; justify-content: center;
				color: var(--accent);
				transition: transform 0.2s, box-shadow 0.2s;
				user-select: none; touch-action: none; -webkit-user-select: none;
				backdrop-filter: blur(8px);
				background: rgba(255,255,255,0.12);
				position: relative;
			}
			.ball svg { width: 72%; height: 72%; position: relative; z-index: 1; }
			.ball:hover { transform: scale(1.08); box-shadow: var(--shadow-lg), 0 0 20px var(--accent-dim); }

			.ball::after {
				content: '';
				position: absolute; inset: -2px; border-radius: 50%;
				background: conic-gradient(var(--accent) 0deg, transparent 60deg, transparent 300deg, var(--accent) 360deg);
				opacity: 0;
				transition: opacity 0.2s;
				animation: ball-spin 3s linear infinite;
			}
			.ball:hover::after { opacity: 0.4; }
			@keyframes ball-spin { to { transform: rotate(360deg); } }


			.ball-menu {
				position: absolute; display: flex; flex-direction: column; gap: 5px;
				opacity: 0; pointer-events: none; transform: translateY(8px) scale(0.95);
				transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1);
			}
			.ball-menu.open { opacity: 1; pointer-events: auto; transform: none; }
			.ball-mini {
				width: 33px; height: 33px; border-radius: 50%;
				background: var(--surface); border: 1px solid var(--border);
				box-shadow: var(--shadow-sm); display: flex; align-items: center; justify-content: center;
				color: var(--muted); cursor: pointer; transition: all 0.15s;
				position: relative; overflow: hidden;
			}
			.ball-mini::after {
				content: ''; position: absolute; width: 100%; height: 100%; top: 0; left: 0;
				background: var(--accent-dim); border-radius: 50%;
				transform: scale(0); opacity: 0;
				transition: transform 0.5s, opacity 0.6s;
				pointer-events: none;
			}
			.ball-mini:active::after {
				transform: scale(4); opacity: 0;
				transition: 0s;
			}
			.ball-mini svg { width: 13px; height: 13px; position: relative; z-index: 1; }
			.ball-mini:hover { color: var(--accent); border-color: var(--accent); background: var(--accent-dim); }
			.ball-mini-wrap { position: relative; display: flex; align-items: center; }
			.ball-mini-label {
				position: absolute; background: var(--surface); border: 1px solid var(--border);
				color: var(--text); padding: 3px 7px; border-radius: 6px;
				font-size: calc(var(--font-size) * 0.72); white-space: nowrap;
				opacity: 0; pointer-events: none; transition: opacity 0.15s;
				box-shadow: var(--shadow-sm);
			}
			.ball-mini-wrap:hover .ball-mini-label { opacity: 1; }

			.section-title { font-size: calc(var(--font-size) * 0.714); font-weight: 700; color: var(--muted); letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 8px; padding-bottom: 5px; border-bottom: 1px solid var(--border); }
			.setting-group-title { font-size: calc(var(--font-size) * 0.857); font-weight: 700; color: var(--text); margin: 18px 0 10px 0; padding-bottom: 4px; border-bottom: 1px solid var(--border); }
			.theme-group-label { font-size: calc(var(--font-size) * 0.714); color: var(--muted); letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 5px; margin-top: 6px; }
			.theme-grid { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 4px; }
			.theme-swatch {
				width: 30px; height: 30px; border-radius: 50%; cursor: pointer;
				border: 2.5px solid transparent; transition: all 0.15s; position: relative;
				box-shadow: var(--shadow-sm); overflow: hidden;
			}
			.theme-swatch.active { border-color: var(--text); box-shadow: 0 0 0 3px var(--accent-dim); }
			.theme-swatch:hover { transform: scale(1.12); }
			.tag-editor { display: flex; flex-direction: column; gap: 5px; }
			.tag-row { display: flex; align-items: center; gap: 6px; padding: 6px 8px; background: var(--surface-hi); border-radius: var(--radius-sm); border: 1px solid var(--border); }
			.tag-row input[type="text"] { flex: 1; padding: 4px 7px; font-size: calc(var(--font-size) * 0.857); }
			.tag-row input[type="color"] { width: 26px; height: 24px; flex-shrink: 0; }
			.tag-row .btn-icon { padding: 3px; }
			.tag-row .btn-icon svg { width: 12px; height: 12px; }
			.divider { border: none; border-top: 1px solid var(--border); margin: 12px 0; }
			.link-row { display: flex; flex-direction: column; gap: 4px; padding: 6px 8px; margin-bottom: 6px; background: var(--surface); border-radius: var(--radius-sm); border: 1px solid var(--border); }
			.link-row .link-head { display: flex; align-items: center; gap: 6px; }
			.link-row .link-body { display: flex; gap: 6px; align-items: center; }
			.link-row .link-plat-tag { display: inline-flex; align-items: center; gap: 3px; padding: 3px 7px; border-radius: 6px; font-size: calc(var(--font-size) * 0.72); font-weight: 600; background: var(--accent-dim); color: var(--accent); flex-shrink: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; line-height: 1.2; }
			.link-row .link-plat-tag.unknown { background: rgba(148,163,184,0.18); color: var(--muted); }
			.link-row .link-plat-tag svg { width: 11px; height: 11px; flex-shrink: 0; }
			.link-summary { display: list-item; cursor: pointer; font-weight: 600; font-size: calc(var(--font-size) * 0.714); color: var(--accent); letter-spacing: 0.06em; text-transform: uppercase; }
			.link-summary:hover { filter: brightness(1.2); }
			.link-row.pinned { border-color: var(--accent); background: var(--accent-dim); }
			.pin-btn { color: var(--muted); }
			.pin-btn.active { color: var(--accent); }
			.extract-card { background: var(--surface-hi); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 9px 11px; display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
			.extract-icon { color: var(--accent); flex-shrink: 0; }
			.extract-icon svg { width: 15px; height: 15px; }
			.extract-text { font-size: calc(var(--font-size) * 0.714); color: var(--muted); margin-bottom: 2px; }
			.extract-url { font-size: calc(var(--font-size) * 0.714); color: var(--accent); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 260px; }

			.toast-host { position: fixed; bottom: 18px; right: 18px; z-index: 9999; display: flex; flex-direction: column; gap: 6px; align-items: flex-end; pointer-events: none; }
			.toast { background: var(--surface); border: 1px solid var(--border); border-left: 3px solid var(--accent); color: var(--text); padding: 8px 12px; border-radius: var(--radius-sm); font-size: calc(var(--font-size) * 0.857); box-shadow: var(--shadow-md); animation: slideIn 0.25s ease; max-width: 240px; pointer-events: auto; }
			.toast-btn { background: transparent; border: none; color: var(--accent); cursor: pointer; font-weight: 600; font-size: inherit; font-family: inherit; padding: 1px 4px; margin-left: 4px; border-radius: 4px; text-decoration: underline; text-underline-offset: 2px; }
			.toast-btn:hover { background: var(--accent-dim); }
			.toast-timer { color: var(--muted); font-size: 0.85em; margin-left: 4px; }
			@keyframes slideIn { from { transform: translateX(16px); opacity: 0; } to { transform: none; opacity: 1; } }

			.tuner-bar {
				position: fixed; bottom: 0; left: 0; right: 0; z-index: 9995;
				background: color-mix(in srgb, var(--surface) 98%, transparent);
				border-top: 1px solid var(--border); backdrop-filter: blur(12px);
				padding: 10px 18px; display: flex; align-items: center; gap: 12px;
				box-shadow: 0 -4px 24px rgba(0,0,0,0.25);
				transition: transform 0.3s ease; transform: translateY(100%);
			}
			.tuner-bar.open { transform: translateY(0); }
			.tuner-bar .slider-group { display: flex; align-items: center; gap: 6px; flex: 1; min-width: 0; }
			.tuner-bar .slider-label { font-size: calc(var(--font-size) * 0.786); color: var(--muted); white-space: nowrap; min-width: 52px; }
			.tuner-bar input[type="range"] { flex: 1; min-width: 50px; }
			.tuner-bar .slider-val { font-size: calc(var(--font-size) * 0.714); color: var(--accent); min-width: 30px; text-align: right; }

			.about-section { padding-top: 4px; font-size: calc(var(--font-size) * 0.786); color: var(--muted); text-align: center; line-height: 1.8; }
			.about-section strong { color: var(--text); }
			.cb-row { display: flex; align-items: center; gap: 7px; cursor: pointer; font-size: calc(var(--font-size) * 0.857); color: var(--text); user-select: none; }
			.mode-radio-group { display: flex; gap: 14px; align-items: center; flex-wrap: wrap; }
			.mode-radio-group label { display: flex; align-items: center; gap: 4px; font-size: calc(var(--font-size) * 0.857); color: var(--text); cursor: pointer; }
			.slider-row { display: flex; align-items: center; gap: 10px; }
			.slider-row .slider-label { font-size: calc(var(--font-size) * 0.786); color: var(--muted); white-space: nowrap; min-width: 52px; }
			.slider-row .slider-val { font-size: calc(var(--font-size) * 0.714); color: var(--accent); min-width: 32px; text-align: right; }
			.setting-inline-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
			.setting-inline-label { font-size: calc(var(--font-size) * 0.857); color: var(--text); white-space: nowrap; min-width: 52px; flex-shrink: 0; }
			.setting-inline-row select { flex: 1; min-width: 0; }
			.setting-inline-row input[type="range"] { flex: 1; min-width: 80px; }
			.setting-inline-val { font-size: calc(var(--font-size) * 0.714); color: var(--accent); min-width: 36px; text-align: right; flex-shrink: 0; }

			.platforms-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(106px, 1fr)); gap: 8px; }
			.platform-card {
				background: var(--surface); border: 1px solid var(--border);
				border-radius: var(--radius); padding: 10px 7px 9px;
				display: flex; flex-direction: column; align-items: center; gap: 5px;
				cursor: pointer; transition: all 0.2s; position: relative;
				animation: cardIn 0.25s ease both; user-select: none; border-bottom: 3px solid transparent;
				box-shadow: var(--shadow-sm);
			}
			.platform-card:hover { border-color: var(--accent); box-shadow: var(--shadow-md); transform: translateY(-2px); }
			.platform-card.drag-over { border-color: var(--accent); background: var(--accent-dim); }
			.platform-category-tag { font-size: calc(var(--font-size) * 0.643); font-weight: 600; padding: 1px 5px; border-radius: 99px; }
			.platform-icon {
				width: 40px; height: 40px; border-radius: var(--platform-icon-r);
				background: var(--surface-hi); display: flex; align-items: center;
				justify-content: center; overflow: hidden; flex-shrink: 0; font-size: 20px;
			}
			.platform-icon img { width: 100%; height: 100%; object-fit: contain; }
			.platform-name { font-size: calc(var(--font-size) * 0.786); font-weight: 500; color: var(--text); text-align: center; word-break: break-all; line-height: 1.3; }
			.platform-actions { position: absolute; top: 3px; right: 3px; display: flex; gap: 2px; opacity: 0; transition: opacity 0.2s; }
			.platform-card:hover .platform-actions { opacity: 1; }
			.platform-actions .btn-icon { padding: 2px; border-radius: 4px; }
			.platform-actions .btn-icon svg { width: 10px; height: 10px; }

			.cover-picker-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 8px; margin-top: 10px; }
			.cover-option {
				border-radius: var(--radius-sm); overflow: hidden; cursor: pointer;
				border: 2px solid var(--border); transition: all 0.15s; position: relative;
				box-shadow: var(--shadow-sm);
			}
			.cover-option:hover { border-color: var(--accent); transform: scale(1.03); }
			.cover-option.selected { border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent); }
			.cover-option img, .cover-option canvas { width: 100%; height: 68px; object-fit: cover; display: block; }
			.cover-option-label { font-size: calc(var(--font-size) * 0.643); color: var(--muted); text-align: center; padding: 3px 4px; background: var(--surface-hi); line-height: 1.3; }

			.hotkey-capturing {
				background: linear-gradient(90deg, transparent, var(--accent-dim), transparent);
				background-size: 200% 100%;
				animation: scan 1.2s ease-in-out infinite;
			}
			@keyframes scan {
				0% { background-position: 0% 50%; }
				50% { background-position: 100% 50%; }
				100% { background-position: 0% 50%; }
			}

			/* 设置面板双栏布局 */
			.settings-layout { display: flex; height: 100%; }
			.settings-nav {
				width: 180px; min-width: 150px; border-right: 1px solid var(--border);
				padding: 12px 0; overflow-y: auto; flex-shrink: 0;

				background: var(--surface);
			}
			.settings-nav-section {
				padding: 8px 16px 4px; font-size: calc(var(--font-size) * 0.643);
				font-weight: 700; color: var(--muted); letter-spacing: 0.05em;
				text-transform: uppercase;
			}
			.settings-nav-item {
				display: flex; align-items: center; gap: 8px; width: 100%;
				padding: 8px 16px; background: transparent; border: none;
				color: var(--muted); font-size: calc(var(--font-size) * 0.857);
				cursor: pointer; border-left: 3px solid transparent;
				transition: all 0.15s; text-align: left; font-family: inherit;
			}
			.settings-nav-item:hover {
				color: var(--text); background: var(--surface-hi);
				border-left-color: var(--border);
			}
			.settings-nav-item.active {
				color: var(--accent); background: var(--accent-dim);
				border-left-color: var(--accent); font-weight: 600;
			}
			.settings-nav-item svg { width: 16px; height: 16px; flex-shrink: 0; }
			.settings-content {
				flex: 1; overflow-y: auto; padding: 14px 18px;
			}
			.settings-section { display: none; }
			.settings-section.active { display: block; }
			.settings-card {
				background: var(--surface);
				border: 1px solid var(--border);
				border-radius: var(--radius);
				padding: 14px 16px;
				margin-bottom: 14px;
				box-shadow: var(--shadow-sm);
				transition: transform 0.15s, box-shadow 0.15s;
			}
			.settings-card:hover {
				transform: translateY(-2px);
				box-shadow: var(--shadow-md);
			}
			.settings-card-title {
				font-size: calc(var(--font-size) * 0.929); font-weight: 600;
				color: var(--text); margin-bottom: 12px; display: flex; align-items: center; gap: 6px;
			}
			.settings-card-title svg { width: 16px; height: 16px; color: var(--accent); }

			@keyframes cardIn {
				from { opacity: 0; transform: translateY(10px); }
				to { opacity: 1; transform: translateY(0); }
			}

			/* 自定义 Tooltip */
			.card-title[data-tip], .list-name[data-tip] { position: relative; }
			.card-title[data-tip]:hover::after, .list-name[data-tip]:hover::after {
				content: attr(data-tip);
				position: absolute; bottom: calc(100% + 6px); left: 0;
				background: var(--surface-hi); border: 1px solid var(--border);
				color: var(--text); padding: 5px 10px; border-radius: 8px;
				font-size: calc(var(--font-size) * 0.786); font-weight: 400;
				white-space: normal; max-width: 240px; word-break: break-all;
				box-shadow: var(--shadow-md); z-index: 20; pointer-events: none;
				animation: fadeIn 0.15s ease;
			}
			@keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }

			/* Skeleton 加载动画 */
			.skeleton {
				background: linear-gradient(90deg, var(--surface) 25%, var(--surface-hi) 50%, var(--surface) 75%);
				background-size: 200% 100%;
				animation: skeleton-shimmer 1.5s ease infinite;
				border-radius: var(--radius-sm);
			}
			@keyframes skeleton-shimmer {
				0% { background-position: 200% 0; }
				100% { background-position: -200% 0; }
			}

			/* 搜索高亮 */
			mark.search-hl {
				background: var(--accent-dim); color: var(--accent);
				border-radius: 2px; padding: 0 1px;
			}

			/* 动画减弱支持 */
			@media (prefers-reduced-motion: reduce) {
				*, *::before, *::after {
					animation-duration: 0.01ms !important;
					animation-iteration-count: 1 !important;
					transition-duration: 0.01ms !important;
				}
				.show-card, .list-row, .platform-card { animation: none !important; }
			}

			/* 响应式适配 */
			@media (max-width: 480px) {
				.panel { border-radius: var(--radius) var(--radius) 0 0; }
				.panel-head { padding: 10px 12px; }
				.panel-head h2 { font-size: calc(var(--font-size) * 0.929); }
				.panel-body { padding: 10px 12px; }
				.panel-foot { padding: 10px 12px; }

				.shows-grid { grid-template-columns: repeat(auto-fill, minmax(105px, 1fr)); gap: 6px; }
				.card-inner { padding: 6px; }
				.card-title { font-size: calc(var(--font-size) * 0.786); }
				.card-actions .btn-icon { min-width: 32px; min-height: 32px; }

				.toolbar { flex-wrap: wrap; gap: 4px; }
				.search-wrap { flex: 1 1 100%; }
				.search-wrap input { font-size: 16px; /* 防止 iOS 自动缩放 */ }
				.filter-select { min-width: 52px; font-size: calc(var(--font-size) * 0.714); padding: 6px 4px; }

				.tabs { gap: 0; }
				.tab-btn { padding: 8px 12px; font-size: calc(var(--font-size) * 0.857); }

				.btn, .btn-ghost, .btn-primary { min-height: 40px; padding: 8px 12px; }
				.btn-icon { min-width: 36px; min-height: 36px; }

				.list-row { padding: 8px; gap: 8px; }
				.list-thumb { width: 48px; height: 32px; }

				.settings-layout { flex-direction: column; }
				.settings-nav { width: 100%; flex-direction: row; overflow-x: auto; border-right: none; border-bottom: 1px solid var(--border); padding: 6px 0; gap: 0; }
				.settings-nav-section { display: none; }
				.settings-nav-item { white-space: nowrap; padding: 8px 12px; border-left: none; border-bottom: 2px solid transparent; min-height: 40px; }
				.settings-nav-item.active { border-left: none; border-bottom-color: var(--accent); }
				.settings-content { padding: 10px 12px; }

				.platforms-grid { grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); }
				.platform-card { padding: 8px; }

				.form-row { flex-direction: column; }
				.form-group input, .form-group select, .form-group textarea { font-size: 16px; /* 防止 iOS 自动缩放 */ }

				.stats-bar { gap: 2px; flex-wrap: wrap; justify-content: center; }
				.stat-item { padding: 4px 6px; }

				.ball { width: 44px !important; height: 44px !important; }
			}
			@media (min-width: 481px) and (max-width: 768px) {
				.shows-grid { grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); }
				.settings-nav { width: 150px; min-width: 130px; }
				.platforms-grid { grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); }
			}
			@media (min-width: 769px) and (max-width: 1024px) {
				.shows-grid { grid-template-columns: repeat(auto-fill, minmax(152px, 1fr)); }
			}

			/* ── 网页导航 ── */
			.nav-search-combo {
				display: flex; align-items: stretch; flex: 1; min-width: 0;
				background: var(--surface-hi); border: 1px solid var(--border);
				border-radius: var(--radius-sm); overflow: hidden;
				transition: border-color 0.15s, box-shadow 0.15s;
			}
			.nav-search-combo:focus-within {
				border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-dim);
			}
			.nav-engine-sel {
				display: flex; align-items: center; flex-shrink: 0;
				border-right: 1px solid var(--border); position: relative;
			}
			.nav-engine-sel select {
				appearance: none; background: transparent; border: none;
				padding: 6px 8px; font-size: calc(var(--font-size) * 0.857);
				cursor: pointer; min-width: 60px; max-width: 110px;
				color: var(--text); font-family: inherit; font-weight: 600;
			}
			.nav-engine-sel .btn-icon { padding: 2px; border: none; box-shadow: none; }
			.nav-engine-sel #n-engine-manage { z-index: 1; }
			.nav-engine-sel #n-engine-manage:hover { color: var(--accent); }
			.nav-engine-sel #n-engine-manage svg { width: 13px; height: 13px; display: block; }
			.nav-search-input {
				flex: 1; min-width: 0; display: flex; align-items: center;
			}
			.nav-search-input input {
				flex: 1; border: none; background: transparent; outline: none;
				padding: 7px 8px; font-size: calc(var(--font-size) * 0.857);
				color: var(--text); font-family: inherit; min-width: 0;
				box-shadow: none !important;
			}
			.nav-engine-sel select:focus {
				outline: none; box-shadow: none !important;
			}
			.nav-search-actions {
				display: flex; align-items: center; gap: 2px; flex-shrink: 0; padding-right: 4px;
			}
			.nav-search-actions button {
				display: flex; align-items: center; justify-content: center;
				width: 26px; height: 26px; border-radius: 4px;
				background: transparent; border: none; cursor: pointer;
				color: var(--muted); transition: all 0.15s; flex-shrink: 0;
			}
			.nav-search-actions button:hover { color: var(--accent); background: var(--accent-dim); }
			.nav-search-actions button svg { width: 16px; height: 16px; }
			.n-cat-bar { display: flex; gap: 5px; flex-wrap: wrap; margin-top: 0px; margin-bottom: 10px; padding-top: 2px; align-items: center; overflow-x: auto; width: 100%; flex-shrink: 0; }
			.n-cat-tab {
				padding: 5px 12px; border-radius: var(--radius-sm);
				font-size: calc(var(--font-size) * 0.857); font-weight: 500;
				cursor: pointer; border: 1px solid var(--border);
				background: var(--surface); color: var(--muted);
				transition: all 0.15s; white-space: nowrap; font-family: inherit;
				user-select: none;
			}
			.n-cat-tab.drag-over { border-color: var(--accent); background: var(--accent-dim); }
			.n-cat-tab:hover { color: var(--text); border-color: var(--muted); transform: translateY(-1px); }
			.n-cat-tab.active {
				background: linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 70%, #fff));
				color: var(--accent-text); border-color: var(--accent);
				box-shadow: 0 2px 10px var(--accent-dim);
			}
			.n-cat-tab .n-cat-ops {
				display: inline-flex; gap: 2px; margin-left: 4px; opacity: 0; transition: opacity 0.15s;
			}
			.n-cat-tab:hover .n-cat-ops { opacity: 1; }
			.n-cat-tab .n-cat-ops .btn-icon { padding: 2px; border: none; box-shadow: none; }
			.n-cat-tab .n-cat-ops .btn-icon svg { width: 10px; height: 10px; }
			.nav-links-grid {
				display: grid; grid-template-columns: repeat(auto-fill, minmax(152px, 1fr)); gap: 10px;
			}
			.nav-link-card {
				background: var(--surface); border: 1px solid var(--border);
				border-radius: var(--radius); padding: 12px;
				cursor: pointer; transition: all 0.2s; position: relative;
				box-shadow: var(--shadow-sm); animation: cardIn 0.2s ease both;
			}
			.nav-link-card:hover {
				transform: translateY(-3px);
				box-shadow: var(--shadow-md), 0 0 0 1px var(--accent);
				border-color: var(--accent);
			}
			.nav-link-icon {
				width: 36px; height: 36px; border-radius: var(--radius-sm);
				background: var(--surface-hi); display: flex; align-items: center;
				justify-content: center; overflow: hidden; flex-shrink: 0;
			}
			.nav-link-icon img { width: 100%; height: 100%; object-fit: contain; }
			.nav-link-title {
				font-size: calc(var(--font-size) * 0.857); font-weight: 600; color: var(--text);
				white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
			}
			.nav-link-desc {
				font-size: calc(var(--font-size) * 0.714); color: var(--muted);
				display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
				overflow: hidden; min-height: 2.4em; margin-top: 3px;
			}
			.nav-link-cats {
				display: flex; gap: 3px; flex-wrap: wrap; margin-top: 6px;
			}
			.nav-link-cat-tag {
				font-size: calc(var(--font-size) * 0.643); font-weight: 600;
				padding: 1px 6px; border-radius: 99px;
				background: var(--accent-dim); color: var(--accent);
			}
			.nav-link-card .card-hover-ops {
				position: absolute; top: 4px; right: 4px; display: flex; gap: 2px;
				opacity: 0; transition: opacity 0.15s;
			}
			.nav-link-card:hover .card-hover-ops { opacity: 1; }
			.nav-link-card .card-hover-ops .btn-icon { padding: 3px; border-radius: 4px; border: none; box-shadow: none; }
			.nav-link-card .card-hover-ops .btn-icon svg { width: 11px; height: 11px; }
			.nav-link-fav-row { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 6px; }
			.nav-link-fav-thumb {
				width: 34px; height: 34px; border: 1.5px solid var(--border);
				border-radius: 6px; overflow: hidden; cursor: pointer; flex-shrink: 0;
				display: flex; align-items: center; justify-content: center;
				background: var(--surface-hi); transition: all 0.15s; position: relative;
			}
			.nav-link-fav-thumb:hover { border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-dim); }
			.nav-link-fav-thumb.selected { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-dim); }
			.nav-link-fav-thumb img { width: 100%; height: 100%; object-fit: contain; }
			.nav-engine-row {
				display: flex; align-items: center; gap: 8px;
				padding: 8px 10px; border-radius: var(--radius-sm);
				border: 1px solid var(--border); background: var(--surface);
				margin-bottom: 5px; transition: background 0.15s;
			}
			.nav-engine-row:hover { background: var(--surface-hi); }
			.n-emoji-preset {
				display: inline-flex; align-items: center; justify-content: center;
				width: 28px; height: 28px; border-radius: 6px; cursor: pointer;
				font-size: 0.95rem; border: 1px solid transparent;
				transition: all 0.15s; background: transparent;
			}
			.n-emoji-preset:hover {
				background: var(--accent-dim); border-color: var(--accent);
				transform: scale(1.15);
			}
			@media (max-width: 480px) {
				.nav-links-grid { grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 6px; }
				.n-cat-bar { gap: 3px; }
				.n-cat-tab { padding: 5px 8px; font-size: calc(var(--font-size) * 0.786); }
			}

			/* ── 笔记模块 ── */
			.notes-layout { display: flex; gap: 0; flex: 1; min-height: 0; overflow: hidden; }
			.notes-tab-content.active { overflow: hidden; }
			.notes-sidebar {
				width: 220px; min-width: 200px; border-right: 1px solid var(--border);
				display: flex; flex-direction: column; flex-shrink: 0; overflow: hidden;
			}
			.notes-sidebar-head {
				padding: 8px 10px; border-bottom: 1px solid var(--border);
				display: flex; gap: 6px; align-items: center; flex-shrink: 0;
			}
			.notes-sidebar-head .search-wrap { flex: 1; min-width: 0; }
			.notes-sidebar-head .search-wrap input { font-size: calc(var(--font-size) * 0.786); padding: 7px 7px 7px 24px; }
			.notes-sidebar-head .search-wrap svg { width: 11px; height: 11px; }
			.notes-resizer { width: 0.5px; cursor: col-resize; background: var(--border); flex-shrink: 0; transition: background 0.15s; }
			.notes-resizer:hover, .notes-resizer.active { background: var(--accent); }
			.notes-list { flex: 1; overflow-y: auto; padding: 6px; }
			.note-card {
				padding: 8px 10px; border-radius: var(--radius-sm); cursor: pointer;
				border: 1px solid var(--border); margin-bottom: 4px;
				transition: all 0.15s; position: relative;
				background: var(--surface);
			}
			.note-card:hover { background: var(--surface-hi); }
			.note-card.active { background: var(--accent-dim); border-color: var(--accent); }
			.note-card-title {
				font-size: calc(var(--font-size) * 0.857); font-weight: 600; color: var(--text);
				white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding-right: 50px;
			}
			.note-card-preview {
				font-size: calc(var(--font-size) * 0.714); color: var(--muted);
				white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px;
			}
			.note-card-date {
				font-size: calc(var(--font-size) * 0.643); color: var(--muted); margin-top: 3px;
			}
			.note-card-ops {
				position: absolute; top: 6px; right: 6px; display: flex; gap: 2px;
				opacity: 0; transition: opacity 0.15s;
			}
			.note-card:hover .note-card-ops { opacity: 1; }
			.note-card-ops .btn-icon { padding: 2px; border: none; box-shadow: none; }
			.note-card-ops .btn-icon svg { width: 11px; height: 11px; }
			.note-card-ops .btn-icon.active { color: var(--accent); }
			.notes-editor {
				flex: 1; display: flex; flex-direction: column; min-width: 0; overflow: hidden;
			}
			.notes-editor-head {
				padding: 8px 12px; border-bottom: 1px solid var(--border); flex-shrink: 0;
			}
			.notes-editor-head input {
				width: 100%; border: none; background: transparent; outline: none;
				font-size: calc(var(--font-size) * 1.0); font-weight: 600; color: var(--text);
				font-family: inherit;
			}
			.notes-toolbar {
				display: flex; gap: 2px; padding: 4px 10px; border-bottom: 1px solid var(--border);
				flex-shrink: 0; flex-wrap: wrap; align-items: center;
			}
			.notes-toolbar .btn-icon { padding: 4px 6px; border: none; box-shadow: none; font-size: calc(var(--font-size) * 0.786); font-weight: 700; }
			.notes-toolbar .btn-icon svg { width: 14px; height: 14px; }
			.notes-toolbar .tb-sep { width: 1px; height: 18px; background: var(--border); margin: 0 4px; }
			.notes-toolbar .tb-label { font-size: calc(var(--font-size) * 0.714); color: var(--muted); font-weight: 600; padding: 0 2px; }
			.notes-edit-area {
				flex: 1; display: flex; overflow: hidden; position: relative;
			}
			.notes-textarea {
				flex: 1; width: 100%; border: none; outline: none; resize: none;
				padding: 12px; font-family: 'JetBrains Mono', monospace, inherit;
				font-size: calc(var(--font-size) * 0.857); line-height: 1.6;
				background: transparent; color: var(--text); tab-size: 4;
			}
			.notes-preview {
				flex: 1; overflow-y: auto; padding: 12px;
				font-size: calc(var(--font-size) * 0.857); line-height: 1.7; color: var(--text);
			}
			.notes-preview h1 { font-size: 1.5em; font-weight: 700; margin: 0.6em 0 0.4em; border-bottom: 1px solid var(--border); padding-bottom: 0.3em; }
			.notes-preview h2 { font-size: 1.3em; font-weight: 700; margin: 0.5em 0 0.3em; }
			.notes-preview h3 { font-size: 1.1em; font-weight: 600; margin: 0.4em 0 0.2em; }
			.notes-preview p { margin: 0.5em 0; }
			.notes-preview strong { font-weight: 700; }
			.notes-preview em { font-style: italic; }
			.notes-preview del { text-decoration: line-through; color: var(--muted); }
			.notes-preview code {
				background: var(--surface-hi); border: 1px solid var(--border);
				padding: 1px 5px; border-radius: 4px; font-family: 'JetBrains Mono', monospace;
				font-size: 0.9em;
			}
			.notes-preview pre {
				background: var(--surface-hi); border: 1px solid var(--border);
				border-radius: var(--radius-sm); padding: 10px 12px; overflow-x: auto;
				margin: 0.6em 0;
			}
			.notes-preview pre code { background: none; border: none; padding: 0; font-size: 0.85em; }
			.notes-preview blockquote {
				border-left: 3px solid var(--accent); padding: 4px 12px; margin: 0.5em 0;
				color: var(--muted); background: var(--accent-dim); border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
			}
			.notes-preview ul, .notes-preview ol { padding-left: 1.5em; margin: 0.4em 0; }
			.notes-preview li { margin: 0.2em 0; }
			.notes-preview hr { border: none; border-top: 1px solid var(--border); margin: 1em 0; }
			.notes-preview a { color: var(--accent); text-decoration: underline; }
			.notes-preview img { max-width: 100%; border-radius: var(--radius-sm); margin: 0.4em 0; }
			.notes-preview table { border-collapse: collapse; width: 100%; margin: 0.5em 0; }
			.notes-preview th, .notes-preview td { border: 1px solid var(--border); padding: 4px 8px; text-align: left; }
			.notes-preview th { background: var(--surface-hi); font-weight: 600; }
			.notes-empty {
				flex: 1; display: flex; flex-direction: column; align-items: center;
				justify-content: center; gap: 8px; color: var(--muted);
			}
			.notes-empty svg { width: 40px; height: 40px; opacity: 0.3; }
			@media (max-width: 600px) {
				.notes-layout { flex-direction: column; height: auto; }
				.notes-sidebar { width: 100%; border-right: none; border-bottom: 1px solid var(--border); max-height: 200px; }
			}

			/* ── 时间工具 ── */
			.timer-wrap { display: flex; flex-direction: column; gap: 16px; padding: 16px; }
			.timer-mode-tabs { display: flex; gap: 2px; background: var(--surface); border-radius: var(--radius-sm); padding: 3px; justify-content: center; width: fit-content; margin: 0 auto; }
			.timer-mode-tab { padding: 6px 14px; border-radius: calc(var(--radius-sm) - 2px); border: none; background: transparent; color: var(--muted); cursor: pointer; font-size: calc(var(--font-size) * 0.857); font-family: inherit; transition: all 0.15s; }
			.timer-mode-tab.active { background: var(--accent-dim); color: var(--accent); }
			.timer-mode-tab:hover { color: var(--text); }
			.timer-display-area { text-align: center; padding: 20px 0; flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; }
			.timer-clock-date { font-size: calc(var(--font-size) * 1.20); color: var(--muted); margin-bottom: 4px; }
			.timer-clock-time { font-size: clamp(8.5em, min(12vw, 12vh), 6em); font-weight: 700; color: var(--text); font-variant-numeric: tabular-nums; letter-spacing: 4px; }
			.timer-digits { font-size: clamp(2em, min(10vw, 10vh), 5em); font-weight: 700; color: var(--text); font-variant-numeric: tabular-nums; letter-spacing: 1px; }
			.timer-phase-label { font-size: calc(var(--font-size) * 1.0); color: var(--accent); font-weight: 600; margin-bottom: 8px; }
			.timer-preset-row { display: flex; gap: 6px; justify-content: center; flex-wrap: wrap; }
			.timer-preset { padding: 5px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border); background: var(--surface); color: var(--text); cursor: pointer; font-size: calc(var(--font-size) * 0.857); font-family: inherit; transition: all 0.15s; }
			.timer-preset:hover, .timer-preset.active { border-color: var(--accent); color: var(--accent); background: var(--accent-dim); }
			.timer-quote { font-size: calc(var(--font-size) * 1.0); color: var(--muted); text-align: center; margin: 12px auto 0; max-width: 80%; line-height: 1.6; cursor: pointer; }
			.timer-quote:hover { color: var(--text); }
			.timer-quote-text { font-size: calc(var(--font-size) * 0.857); color: var(--text); font-style: italic; line-height: 1.6; }
			.timer-quote-author { font-size: calc(var(--font-size) * 0.714); color: var(--muted); margin-top: 4px; }
			.timer-custom-row { display: flex; gap: 6px; align-items: center; justify-content: center; margin-top: 8px; }
			.timer-controls { display: flex; gap: 8px; justify-content: center; margin-top: 12px; flex-shrink: 0; }
			[data-tmode="stopwatch"] .timer-display-area { flex: 0; padding: 20px 0 0; }
			.timer-btn { padding: 8px 24px; border-radius: var(--radius-sm); border: 1px solid var(--border); background: var(--surface); color: var(--text); cursor: pointer; font-size: calc(var(--font-size) * 0.929); font-family: inherit; transition: all 0.15s; }
			.timer-btn:hover { background: var(--surface-hi); }
			.timer-btn.primary { background: var(--accent); color: var(--accent-text); border-color: var(--accent); }
			.timer-btn.primary:hover { opacity: 0.9; }
			.timer-btn.danger { color: #f87171; border-color: rgba(239,68,68,0.3); }
			.timer-btn.danger:hover { background: rgba(239,68,68,0.1); }
			.pomodoro-ring-wrap { position: relative; width: min(30vw, 30vh, 200px); height: min(30vw, 30vh, 200px); margin: 0 auto 12px; }
			.pomodoro-ring-wrap svg { width: 100%; height: 100%; transform: rotate(-90deg); }
			.pomodoro-ring-bg { fill: none; stroke: var(--border); stroke-width: 6; }
			.pomodoro-ring-fg { fill: none; stroke: var(--accent); stroke-width: 6; stroke-linecap: round; transition: stroke-dashoffset 0.5s; }
			.pomodoro-ring-center { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
			.pomodoro-ring-center .timer-digits { font-size: clamp(1.2em, min(8vw, 8vh), 3em); }
			.pomodoro-sessions { display: flex; gap: 6px; justify-content: center; margin-top: 8px; }
			.pomodoro-session-dot { width: 10px; height: 10px; border-radius: 50%; border: 2px solid var(--accent); }
			.pomodoro-session-dot.done { background: var(--accent); }
			.pomodoro-stats { display: flex; gap: 16px; justify-content: center; margin-top: 12px; font-size: calc(var(--font-size) * 0.857); color: var(--muted); }
			.pomodoro-stat-val { font-weight: 700; color: var(--accent); }
			.stopwatch-laps { overflow-y: auto; margin: 8px auto 0; box-sizing: border-box; flex: 1; min-height: 0; width: fit-content; max-width: 80%; }
			.stopwatch-lap { display: flex; justify-content: space-between; gap: 16px; padding: 4px 12px; font-size: calc(var(--font-size) * 0.857); color: var(--muted); font-variant-numeric: tabular-nums; }
			.stopwatch-lap:nth-child(odd) { background: var(--surface); border-radius: var(--radius-sm); }
			.cal-layout { display: flex; gap: 0; flex: 1; min-height: 0; }
			.cal-left { flex: 1 1 50%; min-width: 0; overflow: hidden; display: flex; flex-direction: column; padding: 12px; position: relative; }
			.cal-right { flex: 1 1 50%; min-width: 0; padding: 12px 12px 12px 16px; display: flex; flex-direction: column; }
			.cal-resizer { width: 6px; cursor: col-resize; flex-shrink: 0; position: relative; background: transparent; }
			.cal-resizer::after { content: ''; position: absolute; left: 50%; top: 0; bottom: 0; width: 1px; background: var(--border); transform: translateX(-50%); transition: background 0.15s, width 0.15s; }
			.cal-resizer:hover::after, .cal-resizer.active::after { background: var(--accent); width: 2px; }
			.cal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; flex-shrink: 0; }
			.cal-title-group { font-weight: 600; color: var(--text); font-size: calc(var(--font-size) * 0.929); display: flex; align-items: center; gap: 2px; }
			.cal-clickable { cursor: pointer; color: var(--accent); padding: 2px 4px; border-radius: 4px; transition: background 0.15s; }
			.cal-clickable:hover { background: var(--accent-dim); }
			.cal-nav { display: flex; gap: 4px; }
			.cal-nav button { width: 28px; height: 28px; border-radius: 50%; border: 1px solid var(--border); background: var(--surface); color: var(--text); cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px; transition: all 0.15s; font-family: inherit; }
			.cal-nav button:hover { border-color: var(--accent); color: var(--accent); }
			.cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; }
			.cal-weekday { text-align: center; font-size: calc(var(--font-size) * 0.714); color: var(--muted); padding: 4px 0; font-weight: 600; }
			.cal-day { text-align: center; padding: 3px 2px; border-radius: var(--radius-sm); font-size: calc(var(--font-size) * 0.786); color: var(--text); cursor: pointer; position: relative; min-height: 38px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0; transition: background 0.15s; }
			.cal-day-num { font-size: calc(var(--font-size) * 0.786); line-height: 1.2; }
			.cal-day-lunar { font-size: calc(var(--font-size) * 0.5); line-height: 1.1; color: var(--muted); white-space: nowrap; }
			.cal-day-lunar.first-day { color: var(--muted); font-weight: 700; }
			.cal-day-lunar.holiday { color: var(--accent) !important; font-weight: 700 !important; }
			.cal-day.other { color: var(--muted); opacity: 0.4; }
			.cal-day.other .cal-day-lunar { opacity: 0; }
			.cal-day.today { background: var(--accent-dim); }
			.cal-day.today .cal-day-num { color: var(--accent); font-weight: 700; }
			.cal-day.has-todo::before { content: ''; position: absolute; bottom: 2px; left: 50%; transform: translateX(-50%); width: 4px; height: 4px; border-radius: 50%; background: var(--accent); }
			.cal-day:hover { background: var(--surface-hi); }
			.cal-day.selected { outline: 2px solid var(--accent); outline-offset: -2px; }
			.cal-shows-today { margin-top: 8px; font-size: calc(var(--font-size) * 0.786); color: var(--muted); flex-shrink: 0; word-break: break-all; }
			.cal-shows-today strong { color: var(--text); }
			.cal-shows-toggle { cursor: pointer; user-select: none; display: inline-flex; align-items: center; gap: 4px; font-weight: 500; color: var(--muted); transition: color 0.15s; }
			.cal-shows-toggle:hover { color: var(--text); }
			.cal-shows-toggle svg { width: 10px; height: 10px; transition: transform 0.2s; flex-shrink: 0; }
			.cal-shows-toggle.collapsed svg { transform: rotate(-90deg); }
			.cal-shows-content { display: none; margin-top: 4px; }
			.cal-shows-content.expanded { display: block; }
			#cal-main-area { min-height: 0; overflow-y: auto; }
			/* 全部标注汇总 */
			.cal-marks-summary { flex-shrink: 0; border-top: 1px solid var(--border); padding-top: 8px; margin-top: 8px; }
			.cal-marks-header { display: flex; align-items: center; justify-content: space-between; }
			.cal-marks-summary .cal-shows-toggle { font-size: calc(var(--font-size) * 0.786); font-weight: 600; }
			.cal-marks-list { max-height: 80px; overflow-y: auto; }
			.cal-mark-row { display: flex; align-items: center; gap: 8px; padding: 5px 8px; border-radius: var(--radius-sm); transition: background 0.15s; font-size: calc(var(--font-size) * 0.786); cursor: pointer; }
			.cal-mark-row:hover { background: var(--surface-hi); }
			.cal-mark-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
			.cal-mark-label { flex: 1; color: var(--text); font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; }
			.cal-mark-date { color: var(--muted); flex-shrink: 0; font-size: calc(var(--font-size) * 0.714); }
			.cal-mark-diff { color: var(--accent); font-weight: 600; flex-shrink: 0; font-size: calc(var(--font-size) * 0.714); min-width: 60px; text-align: right; }
			.cal-mark-diff.past { color: var(--muted); }
			.cal-mark-edit { border: none; background: transparent; cursor: pointer; opacity: 0; transition: opacity 0.15s; padding: 2px; flex-shrink: 0; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; color: var(--muted); }
			.cal-mark-row:hover .cal-mark-edit { opacity: 1; }
			.cal-mark-edit:hover { color: var(--accent); }
			.cal-mark-edit svg { width: 12px; height: 12px; }
			/* 待办清单 */
			.cal-todo-date { font-size: calc(var(--font-size) * 0.929); font-weight: 600; color: var(--text); margin-bottom: 10px; flex-shrink: 0; }
			.cal-todo-input-row { display: flex; gap: 6px; margin-bottom: 10px; flex-shrink: 0; }
			.cal-todo-input-row input { flex: 1; }
			.cal-todo-list { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 4px; min-height: 0; }
			.cal-todo-item { display: flex; align-items: center; gap: 8px; padding: 8px 10px; border-radius: var(--radius-sm); background: var(--surface); border: 1px solid var(--border); transition: all 0.15s; }
			.cal-todo-item:hover { border-color: var(--accent); }
			.cal-todo-item.done .cal-todo-text { text-decoration: line-through; color: var(--muted); }
			.cal-todo-text { flex: 1; font-size: calc(var(--font-size) * 0.857); color: var(--text); word-break: break-word; }
			.cal-todo-del { width: 20px; height: 20px; border: none; background: transparent; color: var(--muted); cursor: pointer; display: flex; align-items: center; justify-content: center; border-radius: 4px; opacity: 0; transition: opacity 0.15s; flex-shrink: 0; }
			.cal-todo-item:hover .cal-todo-del { opacity: 1; }
			.cal-todo-del:hover { color: #f87171; background: rgba(239,68,68,0.1); }
			.cal-todo-del svg { width: 12px; height: 12px; }
			.cal-todo-foot { display: flex; align-items: center; justify-content: space-between; margin-top: 8px; flex-shrink: 0; }
			.cal-todo-count { font-size: calc(var(--font-size) * 0.714); color: var(--muted); }
			.cal-todo-empty { text-align: center; padding: 32px 12px; color: var(--muted); font-size: calc(var(--font-size) * 0.857); }
			.cal-todo-actions { display: flex; align-items: center; gap: 4px; }
			.cal-todo-foot-wrap { position: relative; }
			.cal-todo-menu { position: absolute; z-index: 10; right: 0; bottom: 100%; margin-bottom: 4px; background: color-mix(in srgb, var(--bg) 96%, transparent); border: 1px solid var(--border); border-radius: var(--radius); box-shadow: var(--shadow-lg); padding: 4px; min-width: 200px; backdrop-filter: blur(16px); display: none; }
			.cal-todo-menu.open { display: block; }
			.cal-todo-menu-item { display: flex; align-items: center; gap: 6px; padding: 7px 10px; border-radius: var(--radius-sm); border: none; background: transparent; color: var(--text); cursor: pointer; font-size: calc(var(--font-size) * 0.786); font-family: inherit; width: 100%; text-align: left; transition: all 0.15s; }
			.cal-todo-menu-item:hover { background: var(--surface-hi); }
			.cal-todo-menu-item.danger { color: #f87171; }
			.cal-todo-menu-item.danger:hover { background: rgba(239,68,68,0.1); }
			.cal-todo-menu-sep { border: none; border-top: 1px solid var(--border); margin: 4px 0; }
			.cal-right-title { font-size: calc(var(--font-size) * 0.857); font-weight: 600; color: var(--text); margin-bottom: 8px; flex-shrink: 0; }
			.cal-right-list { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 6px; }
			.cal-schedule-item { display: flex; align-items: center; gap: 8px; padding: 8px 10px; border-radius: var(--radius-sm); background: var(--surface); border: 1px solid var(--border); cursor: pointer; transition: all 0.15s; }
			.cal-schedule-item:hover { border-color: var(--accent); background: var(--surface-hi); }
			.cal-si-status { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
			.cal-si-name { font-size: calc(var(--font-size) * 0.857); font-weight: 500; color: var(--text); flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
			.cal-si-ep { font-size: calc(var(--font-size) * 0.786); color: var(--muted); flex-shrink: 0; }
			.cal-empty { text-align: center; padding: 24px; color: var(--muted); font-size: calc(var(--font-size) * 0.857); }
			/* 年/月选择器弹层 */
			.cal-picker { position: absolute; z-index: 10; background: color-mix(in srgb, var(--bg) 96%, transparent); border: 1px solid var(--border); border-radius: var(--radius); box-shadow: var(--shadow-lg); padding: 10px; backdrop-filter: blur(16px); }
			.cal-picker-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; }
			.cal-picker-btn { padding: 8px 4px; border-radius: var(--radius-sm); border: 1px solid transparent; background: transparent; color: var(--text); cursor: pointer; font-size: calc(var(--font-size) * 0.857); font-family: inherit; transition: all 0.15s; text-align: center; }
			.cal-picker-btn:hover { background: var(--surface-hi); border-color: var(--border); }
			.cal-picker-btn.active { background: var(--accent-dim); color: var(--accent); border-color: var(--accent); font-weight: 600; }
			.cal-picker-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
			.cal-picker-head span { font-weight: 600; color: var(--text); font-size: calc(var(--font-size) * 0.857); }
			.cal-picker-head button { width: 24px; height: 24px; border-radius: 50%; border: 1px solid var(--border); background: var(--surface); color: var(--text); cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 12px; font-family: inherit; }
			.cal-picker-head button:hover { border-color: var(--accent); color: var(--accent); }
			/* 自定义下拉（统一向下弹出） */
			.cust-dd { position: relative; flex: 1; min-width: 0; }
			.cust-dd-btn { width: 100%; padding: 8px 28px 8px 10px; border: 1px solid var(--border); border-radius: var(--radius-sm, 6px); background: var(--surface); color: var(--text); font-size: calc(var(--font-size) * 0.857); font-family: inherit; cursor: pointer; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; position: relative; transition: border-color 0.15s; }
			.cust-dd-btn::after { content: '▾'; position: absolute; right: 10px; top: 50%; transform: translateY(-50%); color: var(--muted); font-size: 11px; pointer-events: none; }
			.cust-dd-btn:hover, .cust-dd-btn.open { border-color: var(--accent); }
			.cust-dd-list { position: fixed; z-index: 99999; max-height: 200px; overflow-y: auto; background: color-mix(in srgb, var(--bg) 97%, transparent); border: 1px solid var(--border); border-radius: var(--radius-sm, 6px); box-shadow: var(--shadow-lg, 0 4px 12px rgba(0,0,0,.15)); display: none; min-width: 80px; }
			.cust-dd-list.open { display: block; }
			.cust-dd-opt { padding: 7px 10px; font-size: calc(var(--font-size) * 0.857); color: var(--text); cursor: pointer; white-space: nowrap; transition: background 0.1s; }
			.cust-dd-opt:hover { background: var(--accent-dim); }
			.cust-dd-opt.active { background: var(--accent-dim); color: var(--accent); font-weight: 600; }

			/* 年度总览 */
			.cal-year-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; padding: 8px 0; }
			.cal-mini-month { text-align: center; background: color-mix(in srgb, var(--surface) 60%, var(--border)); border: 1px solid var(--border); border-radius: var(--radius-sm, 6px); padding: 6px 4px; }
			.cal-mini-month-title { font-size: calc(var(--font-size) * 0.786); font-weight: 600; color: var(--text); margin-bottom: 4px; cursor: pointer; padding: 2px 6px; border-radius: 4px; display: inline-block; transition: all 0.15s; }
			.cal-mini-month-title:hover { background: var(--accent-dim); color: var(--accent); }
			.cal-mini-weekday { font-size: calc(var(--font-size) * 0.5); color: var(--muted); padding: 1px; text-align: center; }
			.cal-mini-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 1px; }
			.cal-mini-day { font-size: calc(var(--font-size) * 0.571); padding: 2px 1px; text-align: center; color: var(--text); border-radius: 2px; min-height: 30px; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; gap: 1px; cursor: default; }
			.cal-mini-day.clickable { cursor: pointer; }
			.cal-mini-day.clickable:hover { background: var(--accent-dim); }
			.cal-mini-lunar { font-size: calc(var(--font-size) * 0.429); color: var(--muted); line-height: 1; white-space: nowrap; }
			.cal-mini-lunar.festival { color: var(--accent); font-weight: 600; }
			.cal-mini-day.other { color: var(--muted); opacity: 0.3; }
			.cal-mini-day.today { background: var(--accent-dim); color: var(--accent); font-weight: 700; border-radius: 3px; }
			.cal-mini-day.has-todo::before { content: ''; position: absolute; bottom: 1px; left: 50%; transform: translateX(-50%); width: 3px; height: 3px; border-radius: 50%; background: var(--accent); }
			/* 日期标注 */
			.cal-day.has-mark { background: color-mix(in srgb, var(--accent) 8%, transparent); border: 1px dashed color-mix(in srgb, var(--accent) 40%, transparent); }
			.cal-day.has-mark .cal-day-num { font-weight: 600; }
			.cal-mini-day.has-mark { background: color-mix(in srgb, var(--accent) 8%, transparent); }
			.cal-marks-bar { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; flex-shrink: 0; min-width: 0; overflow: hidden; }
			.cal-mark-badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; border-radius: var(--radius-sm); font-size: calc(var(--font-size) * 0.643); font-weight: 600; color: #fff; max-width: 100%; overflow: hidden; }
			.cal-mark-badge span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
			.cal-mark-del { width: 16px; height: 16px; border: none; background: rgba(255,255,255,0.2); color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; border-radius: 50%; font-size: 10px; transition: background 0.15s; flex-shrink: 0; }
			.cal-mark-del:hover { background: rgba(255,255,255,0.4); }
			.cal-mark-add { display: inline-flex; align-items: center; gap: 4px; padding: 6px 14px; border-radius: var(--radius-sm); font-size: calc(var(--font-size) * 0.786); border: 1px solid var(--accent); background: var(--accent-dim); color: var(--accent); cursor: pointer; font-family: inherit; transition: all 0.15s; white-space: nowrap; font-weight: 600; }
			.cal-mark-add svg { width: 12px; height: 12px; flex-shrink: 0; }
			.cal-mark-add:hover { background: var(--accent); color: var(--accent-text); }
			.cal-mark-add:active { filter: brightness(0.9); transform: translateY(1px); }
			.cal-mark-form { display: flex; gap: 6px; align-items: center; margin-bottom: 10px; flex-shrink: 0; min-width: 0; width: 100%; }
			.cal-mark-form select { max-height: 160px; }
			.cal-mark-form input { flex: 1; }
			.cal-mark-colors { display: flex; gap: 4px; }
			.cal-mark-color { width: 20px; height: 20px; border-radius: 50%; border: 2px solid transparent; cursor: pointer; transition: border-color 0.15s; }
			.cal-mark-color.active { border-color: var(--text); }
			/* 最大化模式 */
			.maximized .timer-wrap {
				height: 100%; padding: 12px 24px; gap: 0;
				justify-content: flex-start;
			}
			.maximized .timer-mode-tabs { flex-shrink: 0; margin-bottom: 16px; }
			.maximized .timer-panel {
				flex: 1; display: flex; flex-direction: column;
				align-items: center; justify-content: center; overflow: hidden;
			}
			.maximized .timer-display-area {
				flex: 1; display: flex; flex-direction: column;
				align-items: center; justify-content: center; padding: 0; width: 100%;
			}
			.maximized .timer-clock-time {
				font-size: clamp(4em, min(25vw, 25vh), 16em);
				letter-spacing: 0.05em;
			}
			.maximized .timer-clock-date { font-size: clamp(1em, 2.5vh, 2em); }
			.maximized .timer-digits {
				font-size: clamp(2.5em, min(14vw, 14vh), 10em);
			}
			.maximized .pomodoro-ring-wrap {
				width: min(40vw, 40vh, 320px); height: min(40vw, 40vh, 320px);
			}
			.maximized .pomodoro-ring-wrap svg { width: 100%; height: 100%; }
			.maximized .pomodoro-ring-center .timer-digits {
				font-size: clamp(2em, min(10vw, 10vh), 6em);
			}
			.maximized .timer-phase-label { font-size: clamp(1em, 2vh, 1.6em); }
			.maximized .pomodoro-stats { display: none; }
			.maximized .timer-preset-row { display: none; }
			.maximized .pomodoro-sessions { display: none; }
			.maximized .stopwatch-laps { display: none; }
			.maximized .timer-controls { flex-shrink: 0; margin-top: 16px; }

			/* ── 视频解析 ── */
			.vp-wrap { display: flex; flex-direction: column; gap: 14px; padding: 16px; }
			.vp-input-row { display: flex; gap: 6px; }
			.vp-input-row input { flex: 1; min-width: 0; }
			.vp-source-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 6px; }
			.vp-source-btn { position: relative; padding: 6px 8px 6px 14px; border-radius: var(--radius-sm); border: 1px solid var(--border); background: var(--surface); color: var(--muted); cursor: pointer; font-size: calc(var(--font-size) * 0.786); text-align: center; transition: all 0.15s; font-family: inherit; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
			.vp-source-btn:hover { border-color: var(--accent); color: var(--text); }
			.vp-source-btn.active { border-color: var(--accent); background: var(--accent-dim); color: var(--accent); font-weight: 600; }
			.vp-source-btn .vp-dot { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); width: 5px; height: 5px; border-radius: 50%; background: var(--border); }
			.vp-dot-fast { background: #4ade80 !important; }
			.vp-dot-slow { background: #fbbf24 !important; }
			.vp-dot-fail { background: #f87171 !important; }
			.vp-action-btn { display: inline-flex; align-items: center; justify-content: center; gap: 5px; border-color: var(--accent); color: var(--accent); background: var(--accent-dim); padding: 6px 8px 6px 14px; font-size: calc(var(--font-size)*0.786); cursor: pointer; transition: all 0.15s; font-family: inherit; border-radius: var(--radius-sm); border-style: solid; border-width: 1px; min-width: 100px; white-space: nowrap; }
			.vp-action-btn:hover { background: var(--accent); color: var(--accent-text, #fff); filter: brightness(1.08); transform: translateY(-1px); }
			.vp-action-btn:active { transform: translateY(0); filter: brightness(0.95); box-shadow: inset 0 1px 3px rgba(0,0,0,0.15); }
			.vp-action-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; filter: none; }
			.vp-action-btn svg { width: 13px; height: 13px; flex-shrink: 0; }
			.vp-section-title { font-size: calc(var(--font-size) * 0.786); font-weight: 600; color: var(--muted); letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 6px; }
			.vp-mode-row { display: flex; gap: 10px; align-items: center; }
			.vp-mode-row label { display: flex; align-items: center; gap: 4px; font-size: calc(var(--font-size) * 0.857); color: var(--text); cursor: pointer; }
			.vp-tip { font-size: calc(var(--font-size) * 0.714); color: var(--muted); line-height: 1.5; }
			.video-player-panel { width: min(960px, 95vw) !important; height: min(600px, 85vh) !important; }
			.video-player-panel .panel-body { padding: 0 !important; flex: 1; display: flex; }

			/* ── 图片嗅探 ── */
			.ig-layout { display: flex; flex: 1; min-height: 0; overflow: hidden; }
			.ig-sidebar { width: 220px; min-width: 120px; border-right: none; display: flex; flex-direction: column; flex-shrink: 0; overflow-y: auto; padding: 10px 12px 10px; gap: 10px; }
			.ig-sidebar .btn { width: 100%; justify-content: center; padding: 6px 10px; flex-shrink: 0; }
			.ig-side-group { display: flex; flex-direction: column; gap: 3px; }
			.ig-side-label { font-size: calc(var(--font-size)*0.714); color: var(--muted); font-weight: 600; letter-spacing: 0.04em; }
			.ig-sidebar select { width: 91%; font-size: calc(var(--font-size)*0.786); padding: 5px 7px; }
			.ig-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }
			.ig-grid { display: grid; gap: 6px; overflow-y: auto; flex: 1; padding: 10px; align-content: start; }
			.ig-grid.size-small { grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); }
			.ig-grid.size-medium { grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); }
			.ig-grid.size-large { grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); }
			.ig-card { position: relative; border-radius: var(--radius-sm); overflow: hidden; border: 2px solid var(--border); background: var(--surface); cursor: pointer; transition: border-color 0.15s, box-shadow 0.15s; min-height: 60px; max-height: 220px; display: flex; align-items: center; justify-content: center; }
			.ig-card:hover { border-color: var(--accent); }
			.ig-card.selected { border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-dim); }
			.ig-card img { width: 100%; height: 100%; max-height: 220px; object-fit: contain; display: block; background: var(--surface-hi); }
			.ig-card .ig-check { position: absolute; top: 4px; right: 4px; width: 16px; height: 16px; accent-color: var(--accent); cursor: pointer; margin: 0; }
			.ig-card .ig-dim { position: absolute; bottom: 0; left: 0; padding: 2px 5px; background: rgba(0,0,0,0.55); color: rgba(255,255,255,0.85); font-size: calc(var(--font-size)*0.6); backdrop-filter: blur(4px); pointer-events: none; }
			.ig-card .ig-actions { position: absolute; bottom: 0; right: 0; display: flex; gap: 2px; padding: 2px; opacity: 0; transition: opacity 0.15s; }
			.ig-card:hover .ig-actions { opacity: 1; }
			.ig-card .ig-actions button { width: 22px; height: 22px; border: none; border-radius: 3px; background: rgba(0,0,0,0.6); color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 11px; backdrop-filter: blur(4px); }
			.ig-card .ig-actions button:hover { background: var(--accent); }
			.ig-top { display: flex; gap: 5px; align-items: center; flex-wrap: wrap; padding: 0 10px 6px; border-bottom: 1px solid var(--border); flex-shrink: 0; }
			.ig-top .btn, .ig-top .filter-select { height: 28px; padding: 3px 7px; font-size: calc(var(--font-size) * 0.786); box-sizing: border-box; }
			.ig-count { font-size: calc(var(--font-size)*0.786); color: var(--accent); font-weight: 600; margin-left: auto; white-space: nowrap; }
			.ig-progress { height: 3px; background: var(--surface-hi); border-radius: 99px; overflow: hidden; flex-shrink: 0; }
			.ig-progress-bar { height: 100%; background: var(--accent); transition: width 0.2s; border-radius: 99px; }
			@media (max-width: 600px) {
				.ig-layout { flex-direction: column; }
				.ig-sidebar { width: 100%; border-right: none; border-bottom: 1px solid var(--border); flex-direction: row; flex-wrap: wrap; padding: 8px; gap: 6px; max-height: 120px; }
				.ig-sidebar .btn { width: auto; }
				.ig-side-group { flex-direction: row; align-items: center; gap: 4px; }
				.ig-sidebar select { width: auto; min-width: 60px; }
			}

			/* ── 工具类 ── */
			.flex-1 { flex: 1; }
			.meta-row { display: flex; align-items: center; gap: 8px; font-size: calc(var(--font-size) * 0.857); color: var(--muted); }
			.dot-accent { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); flex-shrink: 0; }
			.pad-xs { padding: 2px; }
			.btn-full { flex: 1; justify-content: center; }
			.inline-row { display: flex; gap: 6px; align-items: center; }
			.input-row { display: flex; gap: 7px; align-items: center; }
			.muted-text { font-size: calc(var(--font-size) * 0.857); color: var(--muted); }
			.tag-sm { padding: 3px 9px; font-size: calc(var(--font-size) * 0.786); }
			.pad-lg { padding: 20px; }
			.btn-add-full { width: 100%; justify-content: center; margin-top: 7px; }
			.drop-zone { padding: 10px; background: var(--surface); border: 1px dashed var(--border); border-radius: 8px; color: var(--muted); font-size: calc(var(--font-size) * 0.857); }
			.accent-text { color: var(--accent); }
			.danger-text { color: #f87171; }
			.nowrap { white-space: nowrap; }
			.stack { display: flex; flex-direction: column; gap: 8px; }
			.kbd { padding: 1px 5px; background: var(--surface-hi); border: 1px solid var(--border); border-radius: 4px; font-size: 0.8em; font-weight: 600; }
			.muted-sm { font-size: calc(var(--font-size) * 0.8); color: var(--muted); margin-top: 6px; }
		`;
	}

	// ═══════════════════════════════════════════════════════
	//  HELPERS
	// ═══════════════════════════════════════════════════════
	function uid() { return 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5); }

	/** 轻量 Markdown 解析器（笔记模块专用） */
	function parseMarkdown(md) {
		if (!md) return '';
		let html = '';
		const lines = md.split('\n');
		let inCode = false, codeBuf = '', inList = false, listType = '';
		let inBlockquote = false, bqBuf = '';

		const flushList = () => { if (inList) { html += listType === 'ul' ? '</ul>' : '</ol>'; inList = false; } };
		const flushBq = () => { if (inBlockquote) { html += '<blockquote>' + parseInline(bqBuf.trim()) + '</blockquote>'; inBlockquote = false; bqBuf = ''; } };

		const parseInline = (text) => {
			text = escapeHTML(text);
			text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');
			text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
			text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
			text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
			text = text.replace(/__(.+?)__/g, '<strong>$1</strong>');
			text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
			text = text.replace(/_(.+?)_/g, '<em>$1</em>');
			text = text.replace(/~~(.+?)~~/g, '<del>$1</del>');
			return text;
		};

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			// 代码块
			if (line.trimStart().startsWith('```')) {
				if (inCode) { html += escapeHTML(codeBuf) + '</code></pre>'; inCode = false; codeBuf = ''; }
				else { flushList(); flushBq(); inCode = true; html += '<pre><code>'; }
				continue;
			}
			if (inCode) { codeBuf += (codeBuf ? '\n' : '') + line; continue; }
			// 空行
			if (!line.trim()) { flushList(); flushBq(); continue; }
			// 引用
			if (line.startsWith('> ')) {
				flushList();
				if (!inBlockquote) { inBlockquote = true; bqBuf = ''; }
				bqBuf += line.slice(2) + '\n';
				continue;
			} else { flushBq(); }
			// 水平线
			if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) { flushList(); html += '<hr>'; continue; }
			// 标题
			const hMatch = line.match(/^(#{1,6})\s+(.+)/);
			if (hMatch) { flushList(); const lvl = hMatch[1].length; html += `<h${lvl}>${parseInline(hMatch[2])}</h${lvl}>`; continue; }
			// 任务列表
			if (/^[\-\*\+]\s+\[([ xX])\]\s+/.test(line)) {
				if (!inList || listType !== 'ul') { flushList(); html += '<ul>'; inList = true; listType = 'ul'; }
				const checked = /\[[xX]\]/.test(line);
				const text = line.replace(/^[\-\*\+]\s+\[[ xX]\]\s+/, '');
				html += `<li style="list-style:none;"><label><input type="checkbox" disabled ${checked ? 'checked' : ''}> ${parseInline(text)}</label></li>`;
				continue;
			}
			// 无序列表
			if (/^[\-\*\+]\s+/.test(line)) {
				if (!inList || listType !== 'ul') { flushList(); html += '<ul>'; inList = true; listType = 'ul'; }
				html += `<li>${parseInline(line.replace(/^[\-\*\+]\s+/, ''))}</li>`;
				continue;
			}
			// 有序列表
			const olMatch = line.match(/^(\d+)\.\s+(.+)/);
			if (olMatch) {
				if (!inList || listType !== 'ol') { flushList(); html += '<ol>'; inList = true; listType = 'ol'; }
				html += `<li>${parseInline(olMatch[2])}</li>`;
				continue;
			}
			// 表格
			if (line.includes('|') && line.trim().startsWith('|')) {
				// 收集连续的表格行
				const tableLines = [];
				let j = i;
				while (j < lines.length && lines[j].includes('|') && lines[j].trim().startsWith('|')) {
					tableLines.push(lines[j]); j++;
				}
				// 检查是否是有效表格（至少3行：表头+分隔+数据）
				if (tableLines.length >= 2 && /^\|[\s\-:|]+\|$/.test(tableLines[1].trim())) {
					flushList(); flushBq();
					const parseCells = (row) => row.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim());
					const headers = parseCells(tableLines[0]);
					html += '<table><thead><tr>' + headers.map(h => `<th>${parseInline(h)}</th>`).join('') + '</tr></thead><tbody>';
					for (let k = 2; k < tableLines.length; k++) {
						const cells = parseCells(tableLines[k]);
						html += '<tr>' + cells.map(c => `<td>${parseInline(c)}</td>`).join('') + '</tr>';
					}
					html += '</tbody></table>';
					i = j - 1; continue;
				}
			}
			// 普通段落
			flushList();
			html += `<p>${parseInline(line)}</p>`;
		}
		flushList(); flushBq();
		if (inCode) html += escapeHTML(codeBuf) + '</code></pre>';
		return html;
	}

	const WEEKDAY_MAP = {
		Mon: '周一', Tue: '周二', Wed: '周三', Thu: '周四',
		Fri: '周五', Sat: '周六', Sun: '周日',
		daily: '日更', finished: '完结', unset: '',
	};
	function formatSchedule(schedule) { return WEEKDAY_MAP[schedule] || ''; }

	function saveData() { GM_setValue(KEY_DATA, state.shows); }
	function saveSettings() { GM_setValue(KEY_SETTINGS, state.settings); }
	function savePlatforms() { GM_setValue(KEY_PLATFORMS, state.platforms); }
	function savePlatformCategories() { GM_setValue(KEY_PLATFORM_CATS, state.platformCategories); }
	function saveNavCategories() { GM_setValue(KEY_NAV_CATS, state.navCategories); }
	function saveNavLinks() { GM_setValue(KEY_NAV_LINKS, state.navLinks); }
	function saveNavEngines() { GM_setValue(KEY_NAV_ENGINES, state.navEngines); }
	function saveNotes() { GM_setValue(KEY_NOTES, state.notes); }
	function saveTimer() { GM_setValue(KEY_TIMER, state.timer); }
	function saveTodos() { GM_setValue(KEY_TODOS, state.todos); }
	function saveMarks() { GM_setValue(KEY_MARKS, state.marks); }
	function clampDay(d) { const y = d.getFullYear(), m = d.getMonth(), max = new Date(y, m + 1, 0).getDate(); if (d.getDate() > max) d.setDate(max); return d; }

	// ---------- WebDAV 同步 ----------
	function getWebDAVConfig() {
		const saved = GM_getValue(KEY_WEBDAV, null);
		if (!saved) return { ...DEFAULT_WEBDAV };
		return { ...DEFAULT_WEBDAV, ...saved };
	}

	function saveWebDAVConfig(cfg) {
		GM_setValue(KEY_WEBDAV, cfg);
	}

	/**
	 * 测试 WebDAV 连接
	 * 使用 GM.xmlHttpRequest 发送 PROPFIND 请求来判断连接是否成功
	 * @param {object} cfg - WebDAV 配置
	 * @returns {Promise<{success: boolean, message: string}>}
	 */
	async function testWebDAVConnection(cfg) {
		return new Promise((resolve) => {
			GM.xmlHttpRequest({
				method: 'PROPFIND',
				url: cfg.server,
				headers: {
					'Authorization': 'Basic ' + btoa(cfg.username + ':' + cfg.password),
					'Depth': '0'
				},
				onload: function (response) {
					if (response.status >= 200 && response.status < 300) {
						resolve({ success: true, message: '连接成功！' });
					} else if (response.status === 401) {
						resolve({ success: false, message: '认证失败：请检查用户名和应用密码是否正确' });
					} else if (response.status === 403) {
						resolve({ success: false, message: '权限不足：请确认 WebDAV 功能已开启' });
					} else {
						resolve({ success: false, message: `连接失败：服务器返回状态 ${response.status}` });
					}
				},
				onerror: function (err) {
					console.error('[WebDAV] 连接错误:', err);
					resolve({ success: false, message: '网络错误，无法连接到服务器' });
				},
				ontimeout: function () {
					resolve({ success: false, message: '连接超时' });
				}
			});
		});
	}

	/**
	 * 上传数据到 WebDAV 服务器
	 * 使用 GM.xmlHttpRequest 发送 PUT 请求来上传文件
	 * @param {object} cfg - WebDAV 配置
	 * @param {object} data - 要上传的数据
	 * @returns {Promise<boolean>}
	 */
	async function uploadToWebDAV(cfg, data) {
		const jsonStr = JSON.stringify(data, null, 2);
		const filePath = cfg.server + cfg.filename;

		return new Promise((resolve, reject) => {
			GM.xmlHttpRequest({
				method: 'PUT',
				url: filePath,
				headers: {
					'Authorization': 'Basic ' + btoa(cfg.username + ':' + cfg.password),
					'Content-Type': 'application/json'
				},
				data: jsonStr,
				onload: function (response) {
					if (response.status >= 200 && response.status < 300) {
						resolve(true);
					} else if (response.status === 401) {
						reject(new Error('认证失败：请检查用户名和应用密码'));
					} else if (response.status === 403) {
						reject(new Error('权限不足：无法写入文件，请检查 WebDAV 权限设置'));
					} else if (response.status === 507) {
						reject(new Error('存储空间不足'));
					} else {
						reject(new Error(`上传失败：服务器返回状态 ${response.status}`));
					}
				},
				onerror: function (err) {
					console.error('[WebDAV] 上传错误:', err);
					reject(new Error('网络错误，上传失败'));
				},
				ontimeout: function () {
					reject(new Error('上传超时'));
				}
			});
		});
	}

	/**
	 * 从 WebDAV 服务器下载数据
	 * 使用 GM.xmlHttpRequest 发送 GET 请求来下载文件
	 * @param {object} cfg - WebDAV 配置
	 * @returns {Promise<object>} 解析后的 JSON 数据
	 */
	async function downloadFromWebDAV(cfg) {
		const filePath = cfg.server + cfg.filename;

		return new Promise((resolve, reject) => {
			GM.xmlHttpRequest({
				method: 'GET',
				url: filePath,
				headers: {
					'Authorization': 'Basic ' + btoa(cfg.username + ':' + cfg.password)
				},
				onload: function (response) {
					if (response.status >= 200 && response.status < 300) {
						try {
							const data = JSON.parse(response.responseText);
							resolve(data);
						} catch (e) {
							reject(new Error('数据格式错误：无法解析 JSON'));
						}
					} else if (response.status === 404) {
						reject(new Error('云端文件不存在，请先上传一次备份'));
					} else if (response.status === 401) {
						reject(new Error('认证失败：请检查用户名和应用密码'));
					} else {
						reject(new Error(`下载失败：服务器返回状态 ${response.status}`));
					}
				},
				onerror: function (err) {
					console.error('[WebDAV] 下载错误:', err);
					reject(new Error('网络错误，下载失败'));
				},
				ontimeout: function () {
					reject(new Error('下载超时'));
				}
			});
		});
	}

	function updateWebDAVSyncTime() {
		const cfg = getWebDAVConfig();
		cfg.lastSyncTime = Date.now();
		saveWebDAVConfig(cfg);
		// 更新设置面板中的状态显示（如果打开）
		const settingsPanel = App.shadow?.querySelector('.overlay[data-id="settings"] .panel');
		if (settingsPanel) {
			const statusSpan = settingsPanel.querySelector('#webdav-status-text');
			const statusDot = settingsPanel.querySelector('#webdav-status-dot');
			if (statusSpan) statusSpan.textContent = `上次同步：${new Date(cfg.lastSyncTime).toLocaleString()}`;
			if (statusDot) statusDot.style.background = '#4ade80';
		}
	}

	function getTheme() { return THEMES[state.settings.theme] || THEMES.chalk; }
	function getStatus(id) { return state.settings.dict.statuses.find(s => s.id === id) || DEFAULT_STATUSES[0]; }
	function isDark() { return getTheme().dark; }
	function getPlatformCategory(id) { return state.platformCategories.find(c => c.id === id) || null; }

	/** 渲染只读星级（5颗，金色/灰色）*/
	function renderStarDisplay(rating) {
		const r = Math.round(rating || 0);
		let html = '';
		for (let i = 1; i <= 5; i++) {
			html += `<span style="color:${i <= r ? '#fbbf24' : 'var(--border)'}; font-size:inherit; line-height:1;">★</span>`;
		}
		return html;
	}

	function toast(msg, duration = 2600) {
		let host = App.shadow.querySelector('.toast-host');
		if (!host) { host = document.createElement('div'); host.className = 'toast-host'; App.shadow.appendChild(host); }

		// 队列管理：最多显示 3 个，超出时移除最早的
		const MAX_VISIBLE = 3;
		const existing = host.querySelectorAll('.toast');
		if (existing.length >= MAX_VISIBLE) {
			const oldest = existing[0];
			oldest.style.cssText = 'opacity:0;transition:opacity 0.15s;';
			setTimeout(() => oldest.remove(), 160);
		}

		const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg;
		host.appendChild(t);
		setTimeout(() => { t.style.cssText = 'opacity:0;transition:opacity 0.3s;'; setTimeout(() => t.remove(), 320); }, duration);
	}

	function showUndoToast(msg, onUndo, duration = 5000) {
		let host = App.shadow.querySelector('.toast-host');
		if (!host) { host = document.createElement('div'); host.className = 'toast-host'; App.shadow.appendChild(host); }
		const t = document.createElement('div'); t.className = 'toast';
		let remaining = Math.ceil(duration / 1000);
		let timer = null;
		const render = () => {
			t.innerHTML = `${escapeHTML(msg)}<button class="toast-btn">撤销</button><span class="toast-timer">(${remaining}s)</span>`;
			t.querySelector('.toast-btn').onclick = () => { clearInterval(timer); t.remove(); onUndo(); };
		};
		render();
		host.appendChild(t);
		timer = setInterval(() => {
			remaining--;
			if (remaining <= 0) { clearInterval(timer); t.style.cssText = 'opacity:0;transition:opacity 0.3s;'; setTimeout(() => t.remove(), 320); }
			else render();
		}, 1000);
	}

	function generateCoverDataURL(name) {
		const canvas = document.createElement('canvas'); canvas.width = 280; canvas.height = 174;
		drawCanvasCover(canvas, name, 280, 174);
		return canvas.toDataURL();
	}

	/** 在 canvas 上绘制渐变占位封面，自动适配横版/竖版尺寸 */
	function drawCanvasCover(canvas, name, w, h) {
		canvas.width = w; canvas.height = h;
		const ctx = canvas.getContext('2d');
		let hash = 0;
		for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
		const h1 = Math.abs(hash) % 360;
		const h2 = (h1 + 45) % 360;
		const grad = ctx.createLinearGradient(0, 0, w, h);
		grad.addColorStop(0, `hsl(${h1},58%,22%)`);
		grad.addColorStop(1, `hsl(${h2},58%,14%)`);
		ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h);
		ctx.strokeStyle = 'rgba(255,255,255,0.04)'; ctx.lineWidth = 1;
		for (let x = 0; x < w; x += 18) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
		for (let y = 0; y < h; y += 18) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
		const isVertical = w < h;
		const fontSize = isVertical ? Math.min(w / 4, h / 10) : Math.max(12, Math.min(w / 8, h / 4));
		ctx.fillStyle = 'rgba(255,255,255,0.82)';
		ctx.font = `bold ${fontSize}px sans-serif`;
		ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
		if (isVertical && name.length > 2) {
			const mid = Math.ceil(name.length / 2);
			const lh = fontSize * 1.3;
			ctx.fillText(name.slice(0, mid), w / 2, h / 2 - lh / 2);
			ctx.fillText(name.slice(mid), w / 2, h / 2 + lh / 2);
		} else {
			const short = name.length > 6 ? name.slice(0, 5) + '…' : name;
			ctx.fillText(isVertical ? short : (name.length > 10 ? short : name), w / 2, h / 2);
		}
	}

	function cleanTitle(raw) {
		if (!raw) return raw;
		let name = raw;
		const bookMatch = name.match(/《(.+?)》/);
		if (bookMatch) {
			name = bookMatch[1];
		} else {
			name = name.split(/[-_|,，、·\s]+/)[0].trim();
		}
		name = name.replace(/(免费在线观看|在线播放|高清|完整版|未删减|抢先看|预告片|宣传片|花絮|官网|ikanbot\.com|\.com|\.net|\.org)/gi, '').trim();
		name = name.replace(/^[·\-_|,\s]+|[·\-_|,\s]+$/g, '');
		// 移除末尾黏连的类型词（长词优先，避免误删剧名本身）
		const knownTypes = (state.settings.dict.types || DEFAULT_TYPES).map(t => typeof t === 'string' ? t : t.name).slice().sort((a, b) => b.length - a.length);
		for (const t of knownTypes) {
			if (name.length > t.length && name.endsWith(t)) {
				const without = name.slice(0, -t.length).trim();
				if (without && !/^\d+$/.test(without)) { name = without; break; }
			}
		}
		return name || raw;
	}

	function fullWidthToHalf(str) {
		return str.replace(/[０-９]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xFEE0));
	}

	/** 从当前页面提取剧集信息，返回候选集数列表 */
	function extractFromPage() {
		let name = document.title;
		let episodesFound = [];
		let detectedType = null;
		const url = window.location.href;
		const hostname = window.location.hostname;

		// 类型检测
		if (hostname.includes('bilibili') && (url.includes('bangumi') || url.includes('anime') || document.querySelector('.anime'))) detectedType = '动漫';
		if (hostname.includes('iqiyi') && (url.includes('dongman') || document.querySelector('.dongman-tag'))) detectedType = '动漫';
		if (hostname.includes('v.qq') && url.includes('anime')) detectedType = '动漫';
		if (hostname.includes('youku') && url.includes('anime')) detectedType = '动漫';
		if (!detectedType) {
			if (/(动漫|动画|番剧|剧场版|新番)/i.test(name)) detectedType = '动漫';
			else if (/(电影|影片|movie)/i.test(name)) detectedType = '电影';
			else if (/(纪录片|记录片|纪实)/i.test(name)) detectedType = '纪录片';
			else if (/(综艺|真人秀)/i.test(name)) detectedType = '综艺';
		}

		// 移除网站后缀
		[' - 哔哩哔哩', '_腾讯视频', '- 优酷', '- 爱奇艺', ' - YouTube', ' - Netflix', ' - Apple TV+'].forEach(s => { name = name.split(s)[0]; });

		const pushEp = (val) => { const n = parseInt(val); if (n > 0 && n < 2000) episodesFound.push(n); };

		// 1. DOM 高亮集数
		for (const sel of ['.episode-active', '.bpx-player-ctrl-episode-text', '[class*="episode"][class*="active"]', '[class*="ep"][class*="current"]', '.current-episode', '.ep-item.active', '.active-episode', '.playing-episode', '[data-episode-index]']) {
			try {
				const el = document.querySelector(sel); if (!el) continue;
				const dataEp = el.dataset.episodeIndex || el.dataset.ep || el.dataset.episode;
				if (dataEp) { pushEp(fullWidthToHalf(dataEp)); continue; }
				const m = fullWidthToHalf(el.textContent.trim()).match(/(\d+)/);
				if (m) pushEp(m[1]);
			} catch { }
		}
		// 2. URL 参数
		try {
			const params = new URL(url).searchParams;
			for (const key of ['episode', 'ep', 'e', 'p', 'index']) { const v = params.get(key); if (v) pushEp(fullWidthToHalf(v)); }
		} catch { }
		// 3. URL 路径
		for (const re of [/\/ep(\d+)/i, /\/episode[_\-/](\d+)/i, /[/_-]e(\d{1,4})(?:[/_-]|$)/i]) {
			const m = url.match(re); if (m) pushEp(m[1]);
		}
		// 4. meta keywords
		try {
			const kw = document.querySelector('meta[name="keywords"]')?.content;
			if (kw) { const m = fullWidthToHalf(kw).match(/第\s*(\d+)\s*[集话回]/); if (m) pushEp(m[1]); }
		} catch { }
		// 5. 标题文本中的集数模式
		{
			const titleText = fullWidthToHalf(name);
			for (const re of [/第\s*(\d+)\s*[集话回]/, /[Ee][Pp]?\.?\s*(\d+)/i, /S\d+E(\d+)/i, /#\s*(\d+)/, /\[(\d+)\]/, /【(\d+)】/, /（(\d+)）/, /\((\d+)\)/, /第(\d+)[^集话回]/, /(\d+)\s*[集话]/, /_(\d+)_/, /-(\d+)-/]) {
				const m = titleText.match(re);
				if (m) { pushEp(m[1]); name = name.replace(re, '').trim(); break; }
			}
		}

		const uniqueEpisodes = [...new Set(episodesFound)].sort((a, b) => a - b).slice(0, 5);
		const currentEpisode = uniqueEpisodes.length ? uniqueEpisodes[0] : 1;
		name = name.replace(/[-_|·\s]+$/, '').replace(/^\s*[-_|·]+/, '').trim();

		return {
			name,
			currentEpisode,
			candidates: uniqueEpisodes,
			type: detectedType || (typeof state.settings.dict.types[0] === 'string' ? state.settings.dict.types[0] : state.settings.dict.types[0].name),
			status: 'watching',
			coverUrl: document.querySelector('meta[property="og:image"]')?.content || '',
			url: window.location.href,
			rating: 0,
			notes: '',
		};
	}

	/** 收集当前页面所有可能的封面图候选 */
	function collectCoverCandidates(name) {
		const candidates = [];
		const ogImg = document.querySelector('meta[property="og:image"]')?.content;
		if (ogImg) candidates.push({ label: 'og:image', url: ogImg });
		const twImg = document.querySelector('meta[name="twitter:image"]')?.content;
		if (twImg && twImg !== ogImg) candidates.push({ label: 'twitter:image', url: twImg });
		for (const img of Array.from(document.querySelectorAll('img'))) {
			const src = img.src || img.dataset.src || img.dataset.lazySrc;
			if (!src || !/^https?:/.test(src)) continue;
			const w = img.naturalWidth || img.width || parseInt(img.getAttribute('width') || '0');
			if (w >= 300) { candidates.push({ label: '页面大图', url: src }); break; }
		}
		const video = document.querySelector('video[poster]');
		if (video && video.poster) candidates.push({ label: '视频封面', url: video.poster });
		candidates.push({ label: '渐变占位', url: generateCoverDataURL(name), isGenerated: true });
		const seen = new Set();
		return candidates.filter(c => { if (seen.has(c.url)) return false; seen.add(c.url); return true; });
	}

	function getFaviconServices(url) {
		try {
			const host = new URL(url).hostname;
			return [
				`https://favicon.im/zh/${host}`,
				`https://favicon.cccyun.cc/${host}`,
				`https://api.iowen.cn/favicon/${host}.png`,
				`https://icons.duckduckgo.com/ip3/${host}.ico`,
				`https://api.ray.so/favicons?url=${host}`,
				`https://www.google.com/s2/favicons?domain=${host}&sz=64`,
			];
		} catch { return []; }
	}

	async function fetchFavicon(url) {
		const services = getFaviconServices(url);
		for (const service of services) {
			try {
				const controller = new AbortController();
				const timer = setTimeout(() => controller.abort(), 3000);
				const resp = await fetch(service, { mode: 'cors', signal: controller.signal });
				clearTimeout(timer);
				if (resp.ok) return service;
			} catch { /* 继续尝试下一个 */ }
		}
		return '';
	}

	/** 将新链接按域名去重后合并到已有 links 数组，保留各域名的最高集数 */
	function mergeShowLinks(existingShow, newUrl, newEpisode) {
		if (!Array.isArray(existingShow.links)) existingShow.links = [];
		const domainMap = new Map();
		try { domainMap.set(new URL(newUrl).hostname, { url: newUrl, episode: newEpisode }); } catch { }
		for (const link of existingShow.links) {
			try {
				const domain = new URL(link.url).hostname;
				const existing = domainMap.get(domain);
				if (!existing || link.episode > existing.episode) domainMap.set(domain, { url: link.url, episode: link.episode });
			} catch { }
		}
		existingShow.links = Array.from(domainMap.values()).map(item => ({ url: item.url, episode: item.episode }));
		sortLinks(existingShow.links);
		return existingShow;
	}

	// ── URL / DOMAIN UTILITIES（域名联动批量替换） ──
	function parseUrlParts(url) {
		try {
			const u = new URL(url);
			return { protocol: u.protocol, hostname: u.hostname.toLowerCase(), port: u.port };
		} catch { return null; }
	}

	/** 获取平台的置顶链接 URL（优先 urls 数组 + pinnedUrlIdx，否则 url 字段） */
	function getPlatformUrl(p) {
		if (p.urls?.length) {
			const idx = p.pinnedUrlIdx ?? 0;
			return p.urls[idx >= 0 && idx < p.urls.length ? idx : 0] || p.url || '';
		}
		return p.url || '';
	}

	function findPlatformByUrl(url) {
		const p = parseUrlParts(url); if (!p) return null;
		return state.platforms.find(pl => {
			const pp = parseUrlParts(getPlatformUrl(pl));
			return pp && pp.hostname === p.hostname;
		}) || null;
	}

	function collectLinksByHost(targetHost) {
		const matches = [];
		const host = (targetHost || '').toLowerCase();
		if (!host) return matches;
		state.shows.forEach(show => {
			if (!Array.isArray(show.links)) return;
			show.links.forEach((link, linkIdx) => {
				const parts = parseUrlParts(link.url);
				if (parts && parts.hostname === host) matches.push({ show, link, linkIdx });
			});
		});
		return matches;
	}

	function rewriteUrlHost(oldUrl, newParts) {
		try {
			const u = new URL(oldUrl);
			u.protocol = newParts.protocol;
			u.hostname = newParts.hostname;
			u.port = newParts.port || '';
			return u.toString();
		} catch { return oldUrl; }
	}

	function applyReplacement(matches, newParts) {
		const showIds = new Set();
		matches.forEach(({ show, link }) => {
			link.url = rewriteUrlHost(link.url, newParts);
			show.updatedAt = Date.now();
			showIds.add(show.id);
		});
		saveData();
		return { linkCount: matches.length, showCount: showIds.size };
	}

	// ═══════════════════════════════════════════════════════
	//  BALL POSITION UTILITIES
	// ═══════════════════════════════════════════════════════
	const BALL_PRESETS = {
		lt: () => ({ left: '16px', top: '16px', right: 'auto', bottom: 'auto' }),
		lm: (sz) => ({ left: '16px', top: `calc(50vh - ${sz / 2}px)`, right: 'auto', bottom: 'auto' }),
		lb: () => ({ left: '16px', bottom: '16px', right: 'auto', top: 'auto' }),
		rt: () => ({ right: '16px', top: '16px', left: 'auto', bottom: 'auto' }),
		rm: (sz) => ({ right: '16px', top: `calc(50vh - ${sz / 2}px)`, left: 'auto', bottom: 'auto' }),
		rb: () => ({ right: '16px', bottom: '16px', left: 'auto', top: 'auto' }),
	};

	function detectBallPreset(pos) {
		const hasLeft = pos.left && pos.left !== 'auto';
		const hasBottom = pos.bottom && pos.bottom !== 'auto';
		const hasTop = pos.top && pos.top !== 'auto';
		if (hasBottom) return hasLeft ? 'lb' : 'rb';
		if (hasTop && pos.top === '16px') return hasLeft ? 'lt' : 'rt';
		if (hasTop && pos.top.includes('50vh')) return hasLeft ? 'lm' : 'rm';
		return 'rb';
	}

	function applyBallHostPos(host, pos) {
		host.style.top = pos.top || 'auto';
		host.style.bottom = pos.bottom || 'auto';
		host.style.left = pos.left || 'auto';
		host.style.right = pos.right || 'auto';
		host.style.transform = '';
	}

	// ═══════════════════════════════════════════════════════
	//  视频解析工具函数
	// ═══════════════════════════════════════════════════════
	function detectVideoSite() {
		const host = location.hostname;
		return VIDEO_HOSTS.find(h => host === h || host.endsWith('.' + h)) || null;
	}

	function findPlayerContainer() {
		const host = location.hostname;
		return PLAYER_CONTAINERS.find(pc => host === pc.host || host.endsWith('.' + pc.host)) || null;
	}

	function buildParsedUrl(parserUrl, videoUrl) {
		return parserUrl + encodeURIComponent(videoUrl);
	}

	function injectVideoPlayer(parsedUrl) {
		const pc = findPlayerContainer();
		if (!pc) { toast('当前页面未检测到播放器容器'); return false; }
		const container = document.querySelector(pc.container);
		if (!container) { toast('播放器容器未找到'); return false; }
		(pc.displayNodes || []).forEach(sel => {
			document.querySelectorAll(sel).forEach(el => {
				el.style.setProperty('display', 'none', 'important');
				el.style.setProperty('opacity', '0', 'important');
				el.style.setProperty('pointer-events', 'none', 'important');
			});
		});
		container.style.overflow = 'hidden';
		if (getComputedStyle(container).position === 'static') container.style.position = 'relative';
		container.innerHTML = '';
		const wrapper = document.createElement('div');
		wrapper.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;background:#000;z-index:2147483646;';
		const iframe = document.createElement('iframe');
		iframe.src = parsedUrl;
		iframe.style.cssText = 'width:100%;height:100%;border:none;display:block;';
		iframe.allow = 'autoplay;encrypted-media;fullscreen';
		iframe.allowFullscreen = true;
		iframe.referrerPolicy = 'no-referrer';
		wrapper.appendChild(iframe);
		container.appendChild(wrapper);
		return true;
	}

	function playVideo(parserUrl, videoUrl, mode, App) {
		const parsedUrl = buildParsedUrl(parserUrl, videoUrl);
		if (mode === 'inject') {
			if (!injectVideoPlayer(parsedUrl)) {
				if (typeof GM_openInTab === 'function') GM_openInTab(parsedUrl, { active: true, insert: true });
				else window.open(parsedUrl, '_blank');
			}
		} else if (mode === 'iframe' && App) {
			App.openVideoPlayer(parsedUrl, parserUrl, videoUrl);
		} else {
			if (typeof GM_openInTab === 'function') GM_openInTab(parsedUrl, { active: true, insert: true });
			else window.open(parsedUrl, '_blank');
		}
	}

	// ═══════════════════════════════════════════════════════
	//  图片嗅探工具函数
	// ═══════════════════════════════════════════════════════
	const IMG_EXTS = /\.(jpg|jpeg|png|webp|gif|bmp|avif|ico|tiff)(?:\?[^)]*)?$/i;

	/** 从小红书 __INITIAL_STATE__ 提取内容图片（参考 XHS-Downloader） */
	function sniffXHS() {
		try {
			const st = unsafeWindow?.__INITIAL_STATE__;
			if (!st) return [];
			const urls = [];

			// 当前笔记详情页
			const noteData = st.noteData?.data?.noteData || (() => {
				const m = location.pathname.match(/\/explore\/([^?/]+)/);
				return m ? st.note?.noteDetailMap?.[m[1]]?.note : null;
			})();
			if (noteData?.imageList) {
				noteData.imageList.forEach(img => {
					const u = img.urlDefault || img.url;
					if (u) urls.push(u);
				});
				if (urls.length) return urls;
			}

			// 首页 Feed 流 / 搜索结果 / 专辑
			const feedSources = [
				st.feed?.feeds?._rawValue,
				st.search?.feeds?._rawValue,
				st.user?.notes?._rawValue?.[0],
			];
			for (const src of feedSources) {
				if (!Array.isArray(src)) continue;
				src.forEach(item => {
					const card = item?.noteCard;
					if (!card) return;
					// 封面图
					const cover = card.cover?.urlDefault || card.cover?.url;
					if (cover) urls.push(cover);
					// 如有 imageList（详情展开时）
					if (card.imageList) card.imageList.forEach(img => {
						const u = img.urlDefault || img.url;
						if (u) urls.push(u);
					});
				});
			}
			return urls;
		} catch { return []; }
	}

	/** 通用页面轻量嗅探（不触发 getComputedStyle、不遍历全量 DOM） */
	function sniffGeneric() {
		const seen = new Set();
		const results = [];

		const addUrl = (raw) => {
			if (!raw || typeof raw !== 'string') return;
			if (raw.startsWith('data:') || raw.startsWith('blob:')) return;
			try { raw = new URL(raw, location.href).href; } catch { return; }
			if (seen.has(raw)) return;
			seen.add(raw);
			results.push(raw);
		};

		// 1. document.images（比 querySelectorAll('img') 更轻量）
		for (const img of document.images) {
			const src = img.currentSrc || img.src;
			if (src) addUrl(src);
			// 懒加载属性（不调用 getAttribute 循环，逐个写明避免遍历）
			if (img.dataset.src) addUrl(img.dataset.src);
			if (img.dataset.original) addUrl(img.dataset.original);
			if (img.dataset.lazySrc) addUrl(img.dataset.lazySrc);
			if (img.dataset.lazy) addUrl(img.dataset.lazy);
			if (img.dataset.actualSrc) addUrl(img.dataset.actualSrc);
			if (img.dataset.url) addUrl(img.dataset.url);
			if (img.srcset) img.srcset.split(',').forEach(s => { const u = s.trim().split(/\s+/)[0]; if (u) addUrl(u); });
		}

		// 2. <picture><source>
		for (const s of document.querySelectorAll('source[srcset]')) {
			s.srcset.split(',').forEach(seg => { const u = seg.trim().split(/\s+/)[0]; if (u) addUrl(u); });
		}

		// 3. inline style background-image（仅检查带 style 属性的元素，不调用 getComputedStyle）
		for (const el of document.querySelectorAll('[style*="background"]')) {
			const m = el.style.backgroundImage?.match(/url\(["']?(.+?)["']?\)/);
			if (m) addUrl(m[1]);
		}

		// 4. og:image / image_src（head 内少量元素）
		for (const el of document.querySelectorAll('meta[property="og:image"], link[rel="image_src"]')) {
			addUrl(el.content || el.href);
		}

		return results;
	}

	/** 异步加载图片尺寸 */
	function loadImageMeta(url) {
		return new Promise(resolve => {
			const img = new Image();
			img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
			img.onerror = () => resolve({ w: 0, h: 0 });
			img.referrerPolicy = 'no-referrer';
			img.src = url;
			setTimeout(() => { if (!img.complete) resolve({ w: 0, h: 0 }); }, 5000);
		});
	}

	/** 从 URL 或 blob 推断图片格式 */
	function detectImgFormat(url, blob) {
		if (url) {
			// 1. XHS CDN imageView2/format 参数
			const fmtMatch = url.match(/imageView2\/format\/(\w+)/i);
			if (fmtMatch) return fmtMatch[1].toUpperCase();
			// 2. URL 扩展名
			const ext = (url.match(/\.(\w{3,5})(?:[?#]|$)/i) || [])[1]?.toLowerCase();
			const extMap = {jpg:'JPEG',jpeg:'JPEG',png:'PNG',webp:'WebP',gif:'GIF',svg:'SVG',avif:'AVIF',bmp:'BMP',ico:'ICO',heic:'HEIC'};
			if (ext && extMap[ext]) return extMap[ext];
		}
		// 3. Blob MIME 类型
		if (blob?.type) {
			if (blob.type.includes('png')) return 'PNG';
			if (blob.type.includes('webp')) return 'WebP';
			if (blob.type.includes('gif')) return 'GIF';
			if (blob.type.includes('svg')) return 'SVG';
			if (blob.type.includes('jpeg') || blob.type.includes('jpg')) return 'JPEG';
		}
		return 'JPEG';
	}

	/** Canvas 格式转换（JPEG/PNG/WebP 互转） */
	async function convertImageBlob(blob, targetFormat) {
		if (!targetFormat || targetFormat === 'original') return blob;
		const srcFormat = detectImgFormat('', blob);
		if (srcFormat === targetFormat) return blob;
		if (['GIF', 'SVG', 'AVIF', 'BMP', 'ICO'].includes(srcFormat)) return blob;
		const objUrl = URL.createObjectURL(blob);
		try {
			const img = await Promise.race([
				new Promise((resolve, reject) => {
					const el = new Image();
					el.onload = () => resolve(el);
					el.onerror = () => reject(new Error('Image load failed'));
					el.src = objUrl;
				}),
				new Promise((_, reject) => setTimeout(() => reject(new Error('Image timeout')), 8000)),
			]);
			const canvas = document.createElement('canvas');
			canvas.width = img.naturalWidth;
			canvas.height = img.naturalHeight;
			canvas.getContext('2d').drawImage(img, 0, 0);
			const mime = { JPEG: 'image/jpeg', PNG: 'image/png', WebP: 'image/webp' }[targetFormat] || 'image/jpeg';
			const result = await new Promise(r => canvas.toBlob(r, mime, 0.92));
			return result || blob;
		} catch { return blob; }
		finally { URL.revokeObjectURL(objUrl); }
	}

	/** 对 XHS CDN URL 拼接服务端格式转换参数 */
	function xhsFormatUrl(url, targetFormat) {
		if (!targetFormat || targetFormat === 'original') return url;
		if (!/xhscdn\.com|rednotecdn\.com/.test(url)) return url;
		const fmt = { JPEG: 'jpeg', PNG: 'png', WebP: 'webp' }[targetFormat] || 'jpeg';
		return url.split('?')[0] + `?imageView2/format/${fmt}`;
	}

	/** 从 URL 提取原始文件名（不含扩展名） */
	function extractOrigName(url) {
		try {
			const path = new URL(url).pathname;
			const name = path.split('/').pop().replace(/\.\w{2,5}$/, '');
			return sanitizeFilename(decodeURIComponent(name) || 'image');
		} catch { return 'image'; }
	}

	/** 清洗页面标题 */
	function cleanPageTitle() {
		return sanitizeFilename((document.title || 'page').replace(/\s*[-_|].*$/, '').slice(0, 50));
	}

	/** 应用重命名模板 */
	function applyRename(template, idx, total, img) {
		const now = new Date();
		const pad = String(total).length;
		return template
			.replace(/\{NO\}/g, String(idx + 1).padStart(Math.max(3, pad), '0'))
			.replace(/\{EXT\}/g, img.format?.toLowerCase() || getExtFromUrl(img.url))
			.replace(/\{NAME\}/g, extractOrigName(img.url))
			.replace(/\{PAGETITLE\}/g, cleanPageTitle())
			.replace(/\{DATE\}/g, `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}${String(now.getSeconds()).padStart(2,'0')}`)
			.replace(/\{W\}/g, img.w || 0)
			.replace(/\{H\}/g, img.h || 0);
	}

	/** 主嗅探入口 */
	function sniffImages(minSize) {
		minSize = minSize || 0;
		const host = location.hostname;
		const isXHS = /xiaohongshu\.com|rednote\.com/.test(host);
		let urls;

		if (isXHS) {
			// 小红书：优先从 __INITIAL_STATE__ 提取内容图
			urls = sniffXHS();
			// 如果结构化数据拿不到，降级为轻量 DOM 扫描
			if (!urls.length) urls = sniffGeneric();
		} else {
			urls = sniffGeneric();
		}

		// 去重 + 构造结果
		const seen = new Set();
		const results = [];
		for (const raw of urls) {
			if (!raw || raw.startsWith('data:') || raw.startsWith('blob:')) continue;
			let url;
			try { url = new URL(raw, location.href).href; } catch { continue; }
			if (seen.has(url)) continue;
			seen.add(url);
			results.push({ url, selected: results.length < 300 });
		}
		return results;
	}

	async function downloadImageBlob(url, retries = 3) {
		for (let attempt = 1; attempt <= retries; attempt++) {
			try {
				const controller = new AbortController();
				const timer = setTimeout(() => controller.abort(), 15000);
				const response = await fetch(url, {
					method: 'GET',
					headers: { 'accept': 'image/avif,image/webp,image/apng,*/*;q=0.8' },
					referrerPolicy: 'no-referrer',
					signal: controller.signal,
				});
				clearTimeout(timer);
				if (!response.ok) { console.warn(`HTTP ${response.status} 第${attempt}次`); continue; }
				return await response.blob();
			} catch (e) {
				console.warn(`下载异常 第${attempt}次:`, e.message || e);
				if (attempt === retries) throw e;
			}
		}
		throw new Error('下载失败');
	}

	function triggerDownload(filename, blob) {
		const a = document.createElement('a');
		a.href = URL.createObjectURL(blob);
		a.download = filename;
		document.body.appendChild(a); a.click(); a.remove();
		URL.revokeObjectURL(a.href);
	}

	function getExtFromUrl(url) {
		const m = url.match(/\.(\w{3,4})(?:\?|$)/);
		return m ? m[1].toLowerCase() : 'jpg';
	}

	function sanitizeFilename(name) {
		return name.replace(/[<>:"/\\|?*\x00-\x1f]/g, '_').replace(/\s+/g, '_').slice(0, 60);
	}

	// ═══════════════════════════════════════════════════════
	//  TAB REGISTRY
	// ═══════════════════════════════════════════════════════
	const TAB_LABELS = { records: '观看记录', platforms: '观影平台', navlinks: '网页导航', notes: '笔记便签', timer: '时钟工具', calendar: '日程管理', videoparse: '视频解析', imggrab: '图片嗅探' };

	const TAB_REGISTRY = {
		records: {
			label: TAB_LABELS.records,
			buildContent() {
				const cardStyleLabel = state.settings.cardStyle === 'classic' ? '经典卡片（点击切换为沉浸）' : '沉浸卡片（点击切换为经典）';
				return `
					<div class="stats-bar" id="stats-bar"></div>
					<div class="toolbar">
						<div class="search-wrap">${I.search}<input type="text" id="m-search" placeholder="搜索剧名…"></div>
						<select id="m-filter" class="filter-select">
							<option value="all">全部状态</option>
							${state.settings.dict.statuses.map(s => `<option value="${s.id}">${s.label}</option>`).join('')}
						</select>
						<select id="m-type-filter" class="filter-select">
							<option value="all">全部类型</option>
							${state.settings.dict.types.map(t => { const tn = typeof t === 'string' ? t : t.name; return `<option value="${escapeHTML(tn)}">${escapeHTML(tn)}</option>`; }).join('')}
						</select>
						<select id="m-sort" class="filter-select">
							<option value="updatedDesc">默认排序</option>
							<option value="createdDesc">最近添加</option>
							<option value="nameAsc">名称 A-Z</option>
							<option value="progressDesc">进度最高</option>
							<option value="rating">评分最高</option>
						</select>
						<select id="m-schedule-filter" class="filter-select">
							<option value="all">全部周期</option>
							<option value="unset">未设置</option>
							<option value="Mon">周一</option><option value="Tue">周二</option><option value="Wed">周三</option>
							<option value="Thu">周四</option><option value="Fri">周五</option><option value="Sat">周六</option><option value="Sun">周日</option>
							<option value="daily">每日更新</option><option value="finished">已完结</option>
						</select>
						<div class="toolbar-sep"></div>
						<button class="btn-icon ${state.settings.view === 'grid' ? 'active' : ''}" id="m-vgrid" title="卡片视图">${I.grid}</button>
						<button class="btn-icon ${state.settings.view === 'list' ? 'active' : ''}" id="m-vlist" title="列表视图">${I.rows}</button>
						<button class="btn-icon ${state.settings.view === 'grid' ? '' : 'disabled'}" id="m-card-toggle" title="${cardStyleLabel}" style="${state.settings.view !== 'grid' ? 'opacity:0.4;pointer-events:none;' : ''}">${I.cardToggle}</button>
					</div>
					<div id="m-container"></div>`;
			},
			setupEvents(panel, App) {
				// 事件委托：卡片/列表行操作
				const showContainer = panel.querySelector('#m-container');
				if (showContainer) {
					showContainer.addEventListener('click', (e) => {
						const actionBtn = e.target.closest('[data-act]');
						const card = e.target.closest('.show-card, .list-row');
						if (!card) return;
						const showId = card.dataset.showId;
						const show = state.shows.find(s => s.id === showId);
						if (!show) return;

						if (actionBtn) {
							e.stopPropagation();
							const act = actionBtn.dataset.act;
							if (act === 'play') {
								const best = getBestLink(show);
								if (best) window.open(best.url, '_blank');
								else toast('暂无播放链接，请先编辑添加');
							}
							if (act === 'inc') {
								const oldEp = show.currentEpisode || 0;
								const newEp = oldEp + 1;
								const oldLinks = JSON.parse(JSON.stringify(show.links || []));
								show.currentEpisode = newEp;
								show.updatedAt = Date.now();
								if (!Array.isArray(show.history)) show.history = [];
								show.history.push({ ep: newEp, ts: Date.now() });
								try { mergeShowLinks(show, window.location.href, newEp); } catch { }
								saveData(); App.renderShows(panel);
								const overLimit = show.latestEpisode && newEp >= show.latestEpisode;
								const msg = `《${show.name}》→ 第${newEp}集` + (overLimit ? '（已达总集数）' : '');
								showUndoToast(msg, () => {
									show.currentEpisode = oldEp;
									show.links = oldLinks;
									show.updatedAt = Date.now();
									if (show.history?.length) show.history.pop();
									saveData(); App.renderShows(panel);
									toast(`已撤销：《${show.name}》恢复到第${oldEp}集`);
								});
							}
							if (act === 'edit') App.openEdit(show, false, false, false);
							if (act === 'del') {
								const delIdx = state.shows.findIndex(s => s.id === show.id);
								const delShow = state.shows[delIdx];
								state.shows.splice(delIdx, 1);
								saveData(); App.renderShows(panel);
								showUndoToast(`已删除《${show.name}》`, () => {
									state.shows.splice(delIdx, 0, delShow);
									saveData(); App.renderShows(panel);
									toast(`已撤销：《${show.name}》已恢复`);
								});
							}
							return;
						}

						// 卡片整体点击跳转
						const best = getBestLink(show);
						if (best) window.open(best.url, '_blank');
						else toast('暂无播放链接，请先编辑添加');
					});
				}
				panel.querySelector('#m-search').oninput = debounce(() => App.renderShows(panel), 250);
				panel.querySelector('#m-filter').onchange = () => App.renderShows(panel);
				panel.querySelector('#m-type-filter').onchange = () => App.renderShows(panel);
				panel.querySelector('#m-schedule-filter').onchange = () => App.renderShows(panel);
				const sortSel = panel.querySelector('#m-sort');
				sortSel.value = state.settings.sortBy;
				sortSel.onchange = e => { state.settings.sortBy = e.target.value; saveSettings(); App.renderShows(panel); };
			},
			onActivate(panel, { bottomBtn, footInfo, App }) {
				bottomBtn.innerHTML = `${I.plus} 添加条目`;
				bottomBtn.onclick = () => App.openAddShow();
				const search = (panel.querySelector('#m-search')?.value || '').toLowerCase();
				const filter = panel.querySelector('#m-filter')?.value || 'all';
				const typeFilter = panel.querySelector('#m-type-filter')?.value || 'all';
				const scheduleFilter = panel.querySelector('#m-schedule-filter')?.value || 'all';
				let filteredShows = state.shows.filter(s => {
					if (filter !== 'all' && s.status !== filter) return false;
					if (typeFilter !== 'all' && s.type !== typeFilter) return false;
					if (scheduleFilter !== 'all' && s.schedule !== scheduleFilter) return false;
					if (search && !(s.name.toLowerCase().includes(search) || (s.type && s.type.toLowerCase().includes(search)) || (s.notes && s.notes.toLowerCase().includes(search)))) return false;
					return true;
				});
				App.updateFootInfo(panel, filteredShows.length);
			},
		},
		platforms: {
			label: TAB_LABELS.platforms,
			buildContent() {
				const platformCatButtons = state.platformCategories.map(cat =>
					`<button class="plat-filter-btn" data-cat="${cat.id}">${cat.name}</button>`
				).join('');
				return `
					<div class="platform-actions-bar">
						<div class="platform-search-wrap">${I.search}<input type="text" id="p-search" placeholder="搜索平台名称…"></div>
						<button class="plat-filter-btn active" data-cat="all">全部</button>
						${platformCatButtons}
						<button class="btn btn-ghost" id="p-manage-cats" style="padding:4px 10px; font-size:calc(var(--font-size) * 0.786); color:var(--accent);">
							${I.edit} 管理分类
						</button>
						<button class="btn btn-ghost" id="p-batch-replace" style="padding:4px 10px; font-size:calc(var(--font-size) * 0.786); color:var(--accent);" title="批量替换播放链接的域名（应对平台换域名）">
							${I.swap} 域名替换
						</button>
					</div>
					<div id="platforms-container"></div>`;
			},
			setupEvents(panel, App) {
				panel.querySelectorAll('.plat-filter-btn').forEach(btn => {
					btn.addEventListener('click', () => {
						panel.querySelectorAll('.plat-filter-btn').forEach(b => b.classList.remove('active'));
						btn.classList.add('active');
						App.renderPlatforms(panel);
					});
				});
				panel.querySelector('#p-search').oninput = () => App.renderPlatforms(panel);
				const manageCatsBtn = panel.querySelector('#p-manage-cats');
				if (manageCatsBtn) manageCatsBtn.onclick = () => App.openSettings('platform-cats');
				const batchReplaceBtn = panel.querySelector('#p-batch-replace');
				if (batchReplaceBtn) batchReplaceBtn.onclick = () => App.openDomainBatchReplace();
			},
			onActivate(panel, { bottomBtn, footInfo, App }) {
				bottomBtn.innerHTML = `${I.plus} 添加平台`;
				bottomBtn.onclick = () => App.openPlatformEdit(null);
				const catFilter = panel.querySelector('.plat-filter-btn.active')?.dataset.cat || 'all';
				const searchVal = (panel.querySelector('#p-search')?.value || '').trim().toLowerCase();
				let filteredPlatforms = [...state.platforms];
				if (catFilter !== 'all') filteredPlatforms = filteredPlatforms.filter(p => p.category === catFilter);
				if (searchVal) filteredPlatforms = filteredPlatforms.filter(p => p.name.toLowerCase().includes(searchVal));
				footInfo.textContent = `${filteredPlatforms.length} 个平台`;
				const lastUpdate = panel.querySelector('#m-last-update');
				if (lastUpdate) lastUpdate.textContent = formatLastUpdated();
			},
		},
		navlinks: {
			label: TAB_LABELS.navlinks,
			buildContent() {
				return `
					<div class="toolbar">
						<div class="nav-search-combo">
							<div class="nav-engine-sel">
								<select id="n-engine"></select>
								<button id="n-engine-manage" title="管理搜索引擎" style="display:none;padding:4px 6px;background:transparent;border:none;border-left:1px solid var(--border);cursor:pointer;color:var(--muted);line-height:1;">${I.gear}</button>
							</div>
							<div class="nav-search-input">
								<input type="text" id="n-search" placeholder="站内搜索 或 回车全网搜索…">
							</div>
							<div class="nav-search-actions">
								<button id="n-search-clear" title="清空" style="display:none;">${I.x}</button>
								<button id="n-search-go" title="全网搜索">${I.search}</button>
							</div>
						</div>
					</div>
					<div class="n-cat-bar" id="n-cat-bar"></div>
					<div id="n-links-container"></div>`;
			},
			setupEvents(panel, App) {
				App.renderNavEngines(panel);
				const engineManageBtn = panel.querySelector('#n-engine-manage');
				if (engineManageBtn) { engineManageBtn.style.display = 'flex'; engineManageBtn.onclick = () => App.openNavEngineList(); }
				const navSearchInput = panel.querySelector('#n-search');
				const navSearchClear = panel.querySelector('#n-search-clear');
				const navSearchGo = panel.querySelector('#n-search-go');
				const doNavWebSearch = () => {
					const q = navSearchInput.value.trim();
					if (!q) return;
					const eng = state.navEngines.find(en => en.id === state.navActiveEngine);
					if (eng?.url) window.open(eng.url.replace('{q}', encodeURIComponent(q)), '_blank', 'noopener,noreferrer');
				};
				if (navSearchInput) {
					navSearchInput.oninput = debounce(() => { App.renderNavLinks(panel); if (navSearchClear) navSearchClear.style.display = navSearchInput.value ? 'flex' : 'none'; }, 180);
					navSearchInput.onkeydown = (e) => { if (e.key === 'Enter') doNavWebSearch(); };
				}
				if (navSearchClear) { navSearchClear.onclick = () => { navSearchInput.value = ''; navSearchClear.style.display = 'none'; App.renderNavLinks(panel); navSearchInput.focus(); }; }
				if (navSearchGo) navSearchGo.onclick = doNavWebSearch;
			},
			onActivate(panel, { bottomBtn, footInfo, App }) {
				bottomBtn.innerHTML = `${I.plus} 添加网页`;
				bottomBtn.onclick = () => App.openNavLinkEdit(null);
				App.renderNavEngines(panel);
				App.renderNavCategories(panel);
				App.renderNavLinks(panel);
				footInfo.textContent = `${state.navLinks.length} 个网页`;
			},
		},
		notes: {
			label: TAB_LABELS.notes,
			buildContent() {
				return `
					<div class="notes-layout">
						<div class="notes-sidebar" id="nt-sidebar">
							<div class="notes-sidebar-head">
								<div class="search-wrap">${I.search}<input type="text" id="nt-search" placeholder="搜索笔记…"></div>
								<button class="btn-icon" id="nt-search-clear" title="清空" style="display:none;">${I.x}</button>
								<button class="btn btn-primary" id="nt-new" title="新建笔记" style="padding:6px 10px;">${I.plus}</button>
							</div>
							<div class="notes-list" id="nt-list"></div>
						</div>
						<div class="notes-resizer" id="nt-resizer"></div>
						<div class="notes-editor" id="nt-editor">
							<div class="notes-empty" id="nt-empty">
								${I.edit}
								<div style="font-size:calc(var(--font-size)*0.929);font-weight:600;">选择或新建一篇笔记</div>
								<div style="font-size:calc(var(--font-size)*0.786);">支持 Markdown 语法</div>
							</div>
						</div>
					</div>`;
			},
			setupEvents(panel, App) {
				const noteSearchInput = panel.querySelector('#nt-search');
				const noteSearchClear = panel.querySelector('#nt-search-clear');
				if (noteSearchInput) {
					noteSearchInput.oninput = debounce(() => {
						App.renderNotesList(panel);
						if (noteSearchClear) noteSearchClear.style.display = noteSearchInput.value ? 'flex' : 'none';
						const search = noteSearchInput.value.trim().toLowerCase();
						if (search) {
							const matched = state.notes.find(n => (n.title || '').toLowerCase().includes(search) || (n.content || '').toLowerCase().includes(search));
							if (matched && matched.id !== App._currentNoteId) App.openNote(matched.id, panel);
						}
					}, 250);
				}
				if (noteSearchClear) { noteSearchClear.onclick = () => { noteSearchInput.value = ''; noteSearchClear.style.display = 'none'; App.renderNotesList(panel); noteSearchInput.focus(); }; }
				const noteNewBtn = panel.querySelector('#nt-new');
				if (noteNewBtn) noteNewBtn.onclick = () => App.createNote(panel);
				const resizer = panel.querySelector('#nt-resizer');
				const sidebar = panel.querySelector('#nt-sidebar');
				if (resizer && sidebar) {
					let dragging = false, startX = 0, startW = 0;
					resizer.addEventListener('mousedown', (e) => { dragging = true; startX = e.clientX; startW = sidebar.offsetWidth; resizer.classList.add('active'); document.body.style.userSelect = 'none'; });
					window.addEventListener('mousemove', (e) => { if (!dragging) return; const panelW = panel.querySelector('.notes-layout')?.offsetWidth || 600; const newW = Math.max(180, Math.min(panelW * 0.5, startW + (e.clientX - startX))); sidebar.style.width = newW + 'px'; });
					window.addEventListener('mouseup', () => { if (dragging) { dragging = false; resizer.classList.remove('active'); document.body.style.userSelect = ''; } });
				}
			},
			onActivate(panel, { bottomBtn, footInfo, App }) {
				bottomBtn.innerHTML = `${I.plus} 新建笔记`;
				bottomBtn.onclick = () => App.createNote(panel);
				App.renderNotesList(panel);
				footInfo.textContent = `${state.notes.length} 篇笔记`;
			},
		},
		timer: {
			label: TAB_LABELS.timer,
			_clockInterval: null,
			_calendarYear: 0,
			_calendarMonth: 0,

			buildContent() {
				return `
					<div class="timer-wrap">
						<div class="timer-mode-tabs">
							<button class="timer-mode-tab active" data-tmode="clock">时钟</button>
							<button class="timer-mode-tab" data-tmode="countdown">倒计时</button>
							<button class="timer-mode-tab" data-tmode="stopwatch">秒表</button>
							<button class="timer-mode-tab" data-tmode="pomodoro">番茄钟</button>
						</div>

						<!-- 时钟模式 -->
						<div class="timer-panel" data-tmode="clock">
							<div class="timer-display-area">
								<div class="timer-clock-date" id="tm-clock-date"></div>
								<div class="timer-clock-time" id="tm-clock-time"></div>
							</div>
							<div class="pomodoro-stats" id="tm-clock-stats"></div>
							<div class="timer-quote" id="tm-quote"></div>
						</div>

						<!-- 倒计时模式 -->
						<div class="timer-panel" data-tmode="countdown" style="display:none;">
							<div class="timer-display-area">
								<div class="pomodoro-ring-wrap" id="tm-cd-ring-wrap">
									<svg width="160" height="160" viewBox="0 0 160 160">
										<circle class="pomodoro-ring-bg" cx="80" cy="80" r="70"/>
										<circle class="pomodoro-ring-fg" id="tm-cd-ring" cx="80" cy="80" r="70" stroke-dasharray="439.82" stroke-dashoffset="0"/>
									</svg>
									<div class="pomodoro-ring-center">
										<div class="timer-digits" id="tm-cd-digits">05:00</div>
									</div>
								</div>
								<div class="timer-preset-row" id="tm-cd-presets">
									<button class="timer-preset" data-sec="60">1分钟</button>
									<button class="timer-preset" data-sec="300">5分钟</button>
									<button class="timer-preset" data-sec="600">10分钟</button>
									<button class="timer-preset active" data-sec="1500">25分钟</button>
									<button class="timer-preset" data-sec="1800">30分钟</button>
								</div>
								<div class="timer-custom-row">
									<input type="number" id="tm-cd-custom-input" min="1" max="999" placeholder="自定义" style="width:80px;font-size:calc(var(--font-size)*0.786);padding:5px 7px;">
									<span style="font-size:calc(var(--font-size)*0.786);color:var(--muted);">分钟</span>
									<button class="timer-preset" id="tm-cd-custom-set">设定</button>
								</div>
							</div>
							<div class="timer-controls">
								<button class="timer-btn primary" id="tm-cd-start">开始</button>
								<button class="timer-btn" id="tm-cd-reset">重置</button>
							</div>
						</div>

						<!-- 秒表模式 -->
						<div class="timer-panel" data-tmode="stopwatch" style="display:none;">
							<div class="timer-display-area">
								<div class="timer-digits" id="tm-sw-digits">00:00.00</div>
							</div>
							<div class="timer-controls">
								<button class="timer-btn primary" id="tm-sw-start">开始</button>
								<button class="timer-btn" id="tm-sw-lap" disabled>计次</button>
								<button class="timer-btn danger" id="tm-sw-reset">重置</button>
							</div>
							<div class="stopwatch-laps" id="tm-sw-laps"></div>
						</div>

						<!-- 番茄钟模式 -->
						<div class="timer-panel" data-tmode="pomodoro" style="display:none;">
							<div class="timer-display-area">
								<div class="timer-phase-label" id="tm-pd-phase"></div>
								<div class="pomodoro-ring-wrap" id="tm-pd-ring-wrap">
									<svg width="160" height="160" viewBox="0 0 160 160">
										<circle class="pomodoro-ring-bg" cx="80" cy="80" r="70"/>
										<circle class="pomodoro-ring-fg" id="tm-pd-ring" cx="80" cy="80" r="70" stroke-dasharray="439.82" stroke-dashoffset="0"/>
									</svg>
									<div class="pomodoro-ring-center">
										<div class="timer-digits" id="tm-pd-digits">25:00</div>
									</div>
								</div>
								<div class="pomodoro-sessions" id="tm-pd-sessions"></div>
							</div>
							<div class="timer-controls">
								<button class="timer-btn primary" id="tm-pd-start">开始专注</button>
								<button class="timer-btn" id="tm-pd-skip">跳过</button>
								<button class="timer-btn danger" id="tm-pd-reset">重置</button>
							</div>
							<div class="pomodoro-stats" id="tm-pd-stats"></div>
						</div>
					</div>`;
			},

			setupEvents(panel, App) {
				const self = this;
				// 模式切换
				const modeTabs = panel.querySelectorAll('.timer-mode-tab');
				const modePanels = panel.querySelectorAll('.timer-panel');
				const switchMode = (mode) => {
					state.timer.mode = mode;
					modeTabs.forEach(t => t.classList.toggle('active', t.dataset.tmode === mode));
					modePanels.forEach(p => p.style.display = p.dataset.tmode === mode ? '' : 'none');
					if (mode === 'pomodoro') self._updatePomodoroUI(panel);
					if (mode === 'countdown') self._updateCountdownUI(panel);
					if (mode === 'stopwatch') self._updateStopwatchUI(panel);
				};
				modeTabs.forEach(t => t.addEventListener('click', () => switchMode(t.dataset.tmode)));

				// ── 倒计时 ──
				panel.querySelectorAll('#tm-cd-presets .timer-preset').forEach(btn => {
					btn.addEventListener('click', () => {
						const sec = parseInt(btn.dataset.sec);
						state.timer.countdown.duration = sec;
						state.timer.countdown.targetTs = 0;
						panel.querySelectorAll('#tm-cd-presets .timer-preset').forEach(b => b.classList.remove('active'));
						btn.classList.add('active');
						self._updateCountdownUI(panel);
					});
				});
				panel.querySelector('#tm-cd-start')?.addEventListener('click', () => {
					const cd = state.timer.countdown;
					if (cd.targetTs > 0 && cd.targetTs > Date.now()) {
						// 暂停
						cd.duration = Math.max(1, Math.ceil((cd.targetTs - Date.now()) / 1000));
						cd.targetTs = 0;
					} else {
						// 开始
						cd.targetTs = Date.now() + cd.duration * 1000;
					}
					saveTimer(); self._updateCountdownUI(panel);
				});
				panel.querySelector('#tm-cd-reset')?.addEventListener('click', () => {
					state.timer.countdown.targetTs = 0;
					saveTimer(); self._updateCountdownUI(panel);
				});
				panel.querySelector('#tm-cd-custom-set')?.addEventListener('click', () => {
					const val = parseInt(panel.querySelector('#tm-cd-custom-input')?.value);
					if (!val || val < 1 || val > 999) { toast('请输入 1-999 的分钟数'); return; }
					state.timer.countdown.duration = val * 60;
					state.timer.countdown.targetTs = 0;
					saveTimer(); self._updateCountdownUI(panel);
					panel.querySelectorAll('#tm-cd-presets .timer-preset').forEach(b => b.classList.remove('active'));
					toast(`倒计时已设为 ${val} 分钟`);
				});

				// ── 秒表 ──
				panel.querySelector('#tm-sw-start')?.addEventListener('click', () => {
					const sw = state.timer.stopwatch;
					if (sw.running) {
						sw.elapsed += Date.now() - sw.startTs;
						sw.running = false;
						sw.startTs = 0;
					} else {
						sw.startTs = Date.now();
						sw.running = true;
					}
					saveTimer(); self._updateStopwatchUI(panel);
				});
				panel.querySelector('#tm-sw-lap')?.addEventListener('click', () => {
					const sw = state.timer.stopwatch;
					if (!sw.running) return;
					const total = sw.elapsed + (Date.now() - sw.startTs);
					if (!sw._laps) sw._laps = [];
					sw._laps.unshift(total);
					self._updateStopwatchUI(panel);
				});
				panel.querySelector('#tm-sw-reset')?.addEventListener('click', () => {
					state.timer.stopwatch = { ...DEFAULT_TIMER.stopwatch };
					saveTimer(); self._updateStopwatchUI(panel);
				});

				// ── 番茄钟 ──
				panel.querySelector('#tm-pd-start')?.addEventListener('click', () => {
					const pd = state.timer.pomodoro;
					if (pd.running) {
						// 暂停
						const remain = Math.max(0, pd.targetTs - Date.now());
						pd.running = false;
						pd._pausedRemain = remain;
						pd.targetTs = 0;
					} else {
						// 开始/继续
						const dur = pd._pausedRemain || (pd.phase === 'work' ? pd.workMinutes : pd.phase === 'break' ? pd.breakMinutes : pd.longBreakMinutes) * 60000;
						pd.targetTs = Date.now() + dur;
						pd.running = true;
						delete pd._pausedRemain;
					}
					saveTimer(); self._updatePomodoroUI(panel);
				});
				panel.querySelector('#tm-pd-skip')?.addEventListener('click', () => {
					self._pomodoroAdvance(panel);
				});
				panel.querySelector('#tm-pd-reset')?.addEventListener('click', () => {
					const pd = state.timer.pomodoro;
					pd.targetTs = 0; pd.running = false; pd.phase = 'work'; pd.sessionCount = 0;
					delete pd._pausedRemain;
					saveTimer(); self._updatePomodoroUI(panel);
				});

				// 初始渲染
				self._fetchQuote(panel);
				const quoteEl = panel.querySelector('#tm-quote');
				if (quoteEl) { quoteEl.style.cursor = 'pointer'; quoteEl.title = '点击换一句'; quoteEl.addEventListener('click', () => self._fetchQuote(panel, true)); }
				self._startClockInterval(panel);
				switchMode(state.timer.mode || 'clock');
			},

			onActivate(panel, { bottomBtn, footInfo, App }) {
				bottomBtn.innerHTML = `${I.plus} 时钟工具`;
				bottomBtn.onclick = null;
				bottomBtn.style.display = 'none';
				footInfo.textContent = '';
				this._startClockInterval(panel);
				this._updatePomodoroUI(panel);
				this._updateCountdownUI(panel);
				this._updateStopwatchUI(panel);
			},

			// ── 内部方法 ──

			_fetchQuote(panel, force = false) {
				const el = panel.querySelector('#tm-quote');
				if (!el) return;
				const FALLBACK = [
					{ text: '每一个不曾起舞的日子，都是对生命的辜负。', author: '尼采' },
					{ text: '活在当下，别在怀念过去或憧憬未来中浪费掉今天的生活。', author: '佚名' },
					{ text: '人生没有彩排，每一天都是现场直播。', author: '佚名' },
					{ text: '不积跬步，无以至千里；不积小流，无以成江海。', author: '荀子' },
					{ text: '宝剑锋从磨砺出，梅花香自苦寒来。', author: '佚名' },
					{ text: '千里之行，始于足下。', author: '老子' },
					{ text: '天行健，君子以自强不息。', author: '《周易》' },
					{ text: '业精于勤，荒于嬉；行成于思，毁于随。', author: '韩愈' },
					{ text: '学而不思则罔，思而不学则殆。', author: '孔子' },
					{ text: '书山有路勤为径，学海无涯苦作舟。', author: '佚名' },
					{ text: '路漫漫其修远兮，吾将上下而求索。', author: '屈原' },
					{ text: '世上无难事，只怕有心人。', author: '佚名' },
				];
				const render = (text, author, source) => {
					const src = source ? `《${source}》` : '';
					el.innerHTML = `<div class=”timer-quote-text”>”${text}”</div><div class=”timer-quote-author”>—— ${author}${src}</div>`;
				};
				const showFallback = () => {
					const item = FALLBACK[Math.floor(Math.random() * FALLBACK.length)];
					render(item.text, item.author, '');
				};
				// 检查每日缓存
				const today = new Date().toISOString().slice(0, 10);
				const cached = GM_getValue(KEY_QUOTE, null);
				if (!force && cached && cached.date === today && cached.text) {
					render(cached.text, cached.author || '佚名', cached.source || '');
					return;
				}
				// 请求 API
				try {
					GM.xmlHttpRequest({
						method: 'GET',
						url: 'https://v1.hitokoto.cn/?c=d&c=h&c=i&c=k&encode=json',
						headers: { 'Accept': 'application/json' },
						onload: (r) => {
							try {
								const data = JSON.parse(r.responseText);
								if (data.hitokoto) {
									const author = data.from_who || '佚名';
									const source = data.from || '';
									render(data.hitokoto, author, source);
									GM_setValue(KEY_QUOTE, { date: today, text: data.hitokoto, author, source });
								} else { showFallback(); }
							} catch { showFallback(); }
						},
						onerror: showFallback,
						ontimeout: showFallback,
					});
				} catch { showFallback(); }
			},

			_startClockInterval(panel) {
				if (this._clockInterval) clearInterval(this._clockInterval);
				let tickCount = 0;
				const update = () => {
					tickCount++;
					// 秒表和倒计时：每 100ms 更新
					this._updateStopwatchUI(panel);
					this._updateCountdownUI(panel);
					// 时钟、统计、番茄钟、日历：每秒更新
					if (tickCount % 10 === 0) {
						const now = new Date();
						const dateEl = panel.querySelector('#tm-clock-date');
						const timeEl = panel.querySelector('#tm-clock-time');
						const statsEl = panel.querySelector('#tm-clock-stats');
						if (dateEl) {
							const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
							const lunar = solarToLunar(now.getFullYear(), now.getMonth() + 1, now.getDate());
							dateEl.textContent = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 星期${weekdays[now.getDay()]} · ${lunar.branch}${lunar.zodiac}年${lunar.month}${lunar.day}`;
						}
						if (timeEl) {
							const h = String(now.getHours()).padStart(2, '0');
							const m = String(now.getMinutes()).padStart(2, '0');
							const s = String(now.getSeconds()).padStart(2, '0');
							timeEl.textContent = `${h}:${m}:${s}`;
						}
						if (statsEl) {
							const pd = state.timer.pomodoro;
							statsEl.innerHTML = (state.timer.mode === 'pomodoro' && pd.todayCount > 0) ? `今日已完成 <span class="pomodoro-stat-val">${pd.todayCount}</span> 个番茄` : '';
						}
						this._updatePomodoroUI(panel);
						this._checkTimerComplete(panel);
					}
				};
				update();
				this._clockInterval = setInterval(update, 100);
			},

			_formatMs(ms) {
				if (ms <= 0) return '00:00';
				const totalSec = Math.floor(ms / 1000);
				const min = Math.floor(totalSec / 60);
				const sec = totalSec % 60;
				return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
			},

			_formatMsStopwatch(ms) {
				const totalCs = Math.floor(ms / 10);
				const cs = totalCs % 100;
				const totalSec = Math.floor(ms / 1000);
				const sec = totalSec % 60;
				const min = Math.floor(totalSec / 60);
				return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
			},

			_updateCountdownUI(panel) {
				const cd = state.timer.countdown;
				const digits = panel.querySelector('#tm-cd-digits');
				const ring = panel.querySelector('#tm-cd-ring');
				const startBtn = panel.querySelector('#tm-cd-start');
				if (!digits) return;
				let remain;
				if (cd.targetTs > 0) {
					remain = Math.max(0, cd.targetTs - Date.now());
					startBtn.textContent = '暂停';
				} else {
					remain = cd.duration * 1000;
					startBtn.textContent = '开始';
				}
				digits.textContent = this._formatMs(remain);
				const total = cd.duration * 1000;
				const pct = total > 0 ? remain / total : 1;
				const circumference = 2 * Math.PI * 70;
				if (ring) ring.style.strokeDashoffset = circumference * (1 - pct);
			},

			_updateStopwatchUI(panel) {
				const sw = state.timer.stopwatch;
				const digits = panel.querySelector('#tm-sw-digits');
				const startBtn = panel.querySelector('#tm-sw-start');
				const lapBtn = panel.querySelector('#tm-sw-lap');
				if (!digits) return;
				let elapsed = sw.elapsed;
				if (sw.running && sw.startTs) elapsed += Date.now() - sw.startTs;
				digits.textContent = this._formatMsStopwatch(elapsed);
				startBtn.textContent = sw.running ? '暂停' : (sw.elapsed > 0 ? '继续' : '开始');
				if (lapBtn) lapBtn.disabled = !sw.running;
				// 计次列表
				const lapsEl = panel.querySelector('#tm-sw-laps');
				if (lapsEl) {
					if (sw._laps && sw._laps.length) {
						lapsEl.innerHTML = sw._laps.map((t, i) =>
							`<div class="stopwatch-lap"><span>第${sw._laps.length - i}次</span><span>${this._formatMsStopwatch(t)}</span></div>`
						).join('');
					} else {
						lapsEl.innerHTML = '';
					}
				}
			},

			_updatePomodoroUI(panel) {
				const pd = state.timer.pomodoro;
				const digits = panel.querySelector('#tm-pd-digits');
				const phaseLabel = panel.querySelector('#tm-pd-phase');
				const ring = panel.querySelector('#tm-pd-ring');
				const startBtn = panel.querySelector('#tm-pd-start');
				const sessionsEl = panel.querySelector('#tm-pd-sessions');
				const statsEl = panel.querySelector('#tm-pd-stats');
				if (!digits) return;

				// 当前阶段时长
				const phaseMs = (pd.phase === 'work' ? pd.workMinutes : pd.phase === 'break' ? pd.breakMinutes : pd.longBreakMinutes) * 60000;
				let remain;
				if (pd.running && pd.targetTs > 0) {
					remain = Math.max(0, pd.targetTs - Date.now());
				} else if (pd._pausedRemain) {
					remain = pd._pausedRemain;
				} else {
					remain = phaseMs;
				}
				digits.textContent = this._formatMs(remain);

				// 阶段标签
				const phaseNames = { work: '专注中', break: '短休息', longBreak: '长休息' };
				if (pd.running || pd._pausedRemain) {
					if (phaseLabel) phaseLabel.textContent = phaseNames[pd.phase] || '专注中';
				} else {
					if (phaseLabel) phaseLabel.textContent = '准备就绪';
				}

				// 环形进度
				const circumference = 2 * Math.PI * 70;
				const pct = phaseMs > 0 ? remain / phaseMs : 1;
				if (ring) ring.style.strokeDashoffset = circumference * (1 - pct);

				// 按钮文字
				startBtn.textContent = pd.running ? '暂停' : (pd._pausedRemain ? '继续' : `开始${pd.phase === 'work' ? '专注' : '休息'}`);

				// 轮次指示器
				if (sessionsEl) {
					const total = pd.sessionsBeforeLong;
					const done = pd.sessionCount % total;
					sessionsEl.innerHTML = Array.from({ length: total }, (_, i) =>
						`<div class="pomodoro-session-dot${i < done ? ' done' : ''}"></div>`
					).join('');
				}

				// 统计
				if (statsEl) statsEl.innerHTML = `今日 <span class="pomodoro-stat-val">${pd.todayCount}</span> 个番茄`;
			},

			_pomodoroAdvance(panel) {
				const pd = state.timer.pomodoro;
				pd.targetTs = 0;
				pd.running = false;
				delete pd._pausedRemain;
				if (pd.phase === 'work') {
					pd.sessionCount++;
					pd.todayCount++;
					// 保存统计
					const today = new Date().toISOString().slice(0, 10);
					pd.todayDate = today;
					saveTimer();
					// 决定下一阶段
					if (pd.sessionCount % pd.sessionsBeforeLong === 0) {
						pd.phase = 'longBreak';
					} else {
						pd.phase = 'break';
					}
				} else {
					pd.phase = 'work';
				}
				saveTimer();
				this._updatePomodoroUI(panel);
			},

			_checkTimerComplete(panel) {
				const now = Date.now();
				const cd = state.timer.countdown;
				const pd = state.timer.pomodoro;

				// 倒计时结束
				if (cd.targetTs > 0 && cd.targetTs <= now) {
					cd.targetTs = 0;
					saveTimer();
					toast('倒计时结束！');
					try { GM_notification({ title: 'Omni Trail', text: '倒计时结束！', timeout: 5000 }); } catch { }
					this._updateCountdownUI(panel);
				}

				// 番茄钟阶段结束
				if (pd.running && pd.targetTs > 0 && pd.targetTs <= now) {
					if (pd.phase === 'work') {
						toast('专注时间结束！休息一下吧');
						try { GM_notification({ title: 'Omni Trail', text: '专注时间结束！休息一下吧', timeout: 5000 }); } catch { }
					} else {
						toast('休息结束！继续专注吧');
						try { GM_notification({ title: 'Omni Trail', text: '休息结束！继续专注吧', timeout: 5000 }); } catch { }
					}
					this._pomodoroAdvance(panel);
				}
			},
		},
		calendar: {
			label: TAB_LABELS.calendar,
			_calendarYear: 0,
			_calendarMonth: 0,
			_selectedDay: 0,
			_viewMode: 'month', // 'month' | 'year'
			_yearGridCols: 4, // 4=4×3, 3=3×4, 6=6×2

			buildContent() {
				return `
					<div class="cal-layout">
						<div class="cal-left">
							<div class="cal-header">
								<div class="cal-nav"><button id="cal-prev">◀</button></div>
								<span class="cal-title-group">
									<span class="cal-clickable" id="cal-year-btn"></span><span>年</span>
									<span class="cal-clickable" id="cal-month-btn"></span><span>月</span>
								</span>
								<div class="cal-nav">
									<button id="cal-today" title="回到今天">今</button>
									<button id="cal-next">▶</button>
									<button id="cal-view-toggle" title="切换年/月视图">年</button>
									<button id="cal-grid-toggle" title="切换年视图网格" style="display:none;font-size:calc(var(--font-size)*0.643);width:auto;border-radius:var(--radius-sm);padding:0 5px;">4×3</button>
									<button id="cal-weekstart" title="切换周起始日（日/一）" style="font-size:calc(var(--font-size)*0.714);width:auto;border-radius:var(--radius-sm);padding:0 6px;">${state.settings.weekStart === 1 ? '一' : '日'}</button>
								</div>
							</div>
							<div id="cal-main-area"></div>
							<div class="cal-marks-summary" id="cal-marks-summary">
								<div class="cal-marks-header">
									<div class="cal-shows-toggle" id="cal-marks-toggle">${I.tag} 全部标注 (<span id="cal-marks-count">0</span>) <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg></div>
								</div>
								<div class="cal-marks-list" id="cal-marks-list"></div>
							</div>
							<div class="cal-shows-today" id="cal-shows">
								<div class="cal-shows-toggle collapsed" id="cal-shows-toggle">${I.filter} 今日更新 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg></div>
								<div class="cal-shows-content" id="cal-shows-content"></div>
							</div>
						</div>
						<div class="cal-resizer" id="cal-resizer"></div>
						<div class="cal-right">
							<div class="cal-todo-date" id="cal-todo-date">今日待办</div>
							<div class="cal-marks-bar" id="cal-marks-bar"></div>
							<div class="cal-todo-input-row">
								<input type="text" id="cal-todo-input" placeholder="添加待办事项…">
								<button class="btn btn-primary" id="cal-todo-add" style="padding:6px 10px;">${I.plus}</button>
							</div>
							<div class="cal-todo-list" id="cal-todo-list"></div>
							<div class="cal-todo-foot">
								<span class="cal-todo-count" id="cal-todo-count"></span>
								<div class="cal-todo-foot-wrap">
									<div class="cal-todo-actions">
										<button class="btn btn-danger" id="cal-todo-clear" style="font-size:calc(var(--font-size)*0.714);padding:6px 8px;">清空已完成</button>
										<button class="btn btn-icon" id="cal-todo-menu-btn" title="更多操作" style="padding:4px;">⋯</button>
									</div>
									<div class="cal-todo-menu" id="cal-todo-menu">
										<button class="cal-todo-menu-item danger" data-action="del-day">删除当日待办与标注</button>
										<button class="cal-todo-menu-item danger" data-action="del-month">删除本月待办与标注</button>
										<button class="cal-todo-menu-item danger" data-action="del-year">删除本年待办与标注</button>
										<button class="cal-todo-menu-item danger" data-action="del-all">删除全部待办与标注</button>
										<hr class="cal-todo-menu-sep">
										<button class="cal-todo-menu-item" data-action="export">导出日程数据</button>
										<button class="cal-todo-menu-item" data-action="import">导入日程数据</button>
									</div>
								</div>
							</div>
						</div>
					</div>`;
			},

			setupEvents(panel, App) {
				const self = this;
				self._app = App;
				const now = new Date();
				self._calendarYear = now.getFullYear();
				self._calendarMonth = now.getMonth();
				self._selectedDay = now.getDate();
				self._viewMode = 'month';

				panel.querySelector('#cal-prev')?.addEventListener('click', () => {
					if (self._viewMode === 'year') { self._calendarYear--; self._renderYearView(panel); }
					else { self._calendarMonth--; if (self._calendarMonth < 0) { self._calendarMonth = 11; self._calendarYear--; } self._renderCalendar(panel); }
				});
				panel.querySelector('#cal-next')?.addEventListener('click', () => {
					if (self._viewMode === 'year') { self._calendarYear++; self._renderYearView(panel); }
					else { self._calendarMonth++; if (self._calendarMonth > 11) { self._calendarMonth = 0; self._calendarYear++; } self._renderCalendar(panel); }
				});
				panel.querySelector('#cal-today')?.addEventListener('click', () => {
					const d = new Date();
					self._calendarYear = d.getFullYear(); self._calendarMonth = d.getMonth(); self._selectedDay = d.getDate();
					self._viewMode = 'month'; self._updateViewToggle(panel); self._renderCalendar(panel);
				});
				panel.querySelector('#cal-view-toggle')?.addEventListener('click', () => {
					self._viewMode = self._viewMode === 'month' ? 'year' : 'month';
					self._updateViewToggle(panel);
					if (self._viewMode === 'year') self._renderYearView(panel);
					else self._renderCalendar(panel);
				});
				panel.querySelector('#cal-grid-toggle')?.addEventListener('click', () => {
					self._yearGridCols = self._yearGridCols === 4 ? 3 : self._yearGridCols === 3 ? 6 : 4;
					panel.querySelector('#cal-grid-toggle').textContent = self._yearGridCols === 4 ? '4×3' : self._yearGridCols === 3 ? '3×4' : '6×2';
					self._renderYearView(panel);
				});
				panel.querySelector('#cal-year-btn')?.addEventListener('click', (e) => self._showYearPicker(panel, e.target));
				panel.querySelector('#cal-month-btn')?.addEventListener('click', (e) => self._showMonthPicker(panel, e.target));
				panel.querySelector('#cal-weekstart')?.addEventListener('click', () => {
					state.settings.weekStart = state.settings.weekStart === 0 ? 1 : 0;
					saveSettings();
					panel.querySelector('#cal-weekstart').textContent = state.settings.weekStart === 1 ? '一' : '日';
					if (self._viewMode === 'year') self._renderYearView(panel);
					else self._renderCalendar(panel);
				});

				// 分栏拖拽
				const resizer = panel.querySelector('#cal-resizer');
				const calLeft = panel.querySelector('.cal-left');
				const calLayout = panel.querySelector('.cal-layout');
				if (resizer && calLeft) {
					let dragging = false, startX = 0, startW = 0;
					resizer.addEventListener('mousedown', (e) => { dragging = true; startX = e.clientX; startW = calLeft.offsetWidth; resizer.classList.add('active'); document.body.style.userSelect = 'none'; });
					window.addEventListener('mousemove', (e) => { if (!dragging) return; const layoutW = calLayout?.offsetWidth || 600; const newW = Math.max(layoutW * 0.25, Math.min(layoutW * 0.75, startW + (e.clientX - startX))); calLeft.style.flex = `0 0 ${newW}px`; });
					window.addEventListener('mouseup', () => { if (dragging) { dragging = false; resizer.classList.remove('active'); document.body.style.userSelect = ''; } });
				}

				// 今日更新折叠
				const toggleEl = panel.querySelector('#cal-shows-toggle');
				if (toggleEl) {
					toggleEl.addEventListener('click', () => {
						const content = panel.querySelector('#cal-shows-content');
						const isCollapsed = toggleEl.classList.contains('collapsed');
						toggleEl.classList.toggle('collapsed', !isCollapsed);
						toggleEl.classList.toggle('expanded', isCollapsed);
						if (content) { content.classList.toggle('expanded', isCollapsed); content.classList.toggle('collapsed', !isCollapsed); }
					});
				}

				// 全部标注折叠
				const marksToggle = panel.querySelector('#cal-marks-toggle');
				if (marksToggle) {
					marksToggle.addEventListener('click', () => {
						const list = panel.querySelector('#cal-marks-list');
						const isCollapsed = marksToggle.classList.contains('collapsed');
						marksToggle.classList.toggle('collapsed', !isCollapsed);
						marksToggle.classList.toggle('expanded', isCollapsed);
						if (list) { list.style.display = isCollapsed ? '' : 'none'; }
					});
				}

				// 待办清单事件
				const todoInput = panel.querySelector('#cal-todo-input');
				const todoAddBtn = panel.querySelector('#cal-todo-add');
				const todoClearBtn = panel.querySelector('#cal-todo-clear');
				const addTodo = () => {
					const text = todoInput?.value.trim();
					if (!text) return;
					const dateKey = self._dateToKey(self._calendarYear, self._calendarMonth, self._selectedDay);
					if (!state.todos[dateKey]) state.todos[dateKey] = [];
					state.todos[dateKey].push({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), text, done: false, ts: Date.now() });
					saveTodos();
					todoInput.value = '';
					self._renderTodos(panel);
					self._renderCalendar(panel);
					todoInput.focus();
				};
				if (todoAddBtn) todoAddBtn.addEventListener('click', addTodo);
				if (todoInput) todoInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') addTodo(); });
				if (todoClearBtn) todoClearBtn.addEventListener('click', () => {
					const dateKey = self._dateToKey(self._calendarYear, self._calendarMonth, self._selectedDay);
					const todos = state.todos[dateKey] || [];
					const remaining = todos.filter(t => !t.done);
					if (remaining.length === todos.length) { toast('没有已完成的待办'); return; }
					state.todos[dateKey] = remaining;
					saveTodos();
					self._renderTodos(panel);
					self._renderCalendar(panel);
				});

				// 更多操作菜单
				const menuBtn = panel.querySelector('#cal-todo-menu-btn');
				const menuEl = panel.querySelector('#cal-todo-menu');
				if (menuBtn && menuEl) {
					menuBtn.addEventListener('click', (e) => { e.stopPropagation(); menuEl.classList.toggle('open'); });
					panel.addEventListener('mousedown', (e) => { if (!menuEl.contains(e.target) && e.target !== menuBtn) menuEl.classList.remove('open'); });
					menuEl.addEventListener('click', (e) => {
						const item = e.target.closest('.cal-todo-menu-item');
						if (!item) return;
						menuEl.classList.remove('open');
						const action = item.dataset.action;
						const y = self._calendarYear, m = self._calendarMonth, d = self._selectedDay;
						const dateKey = self._dateToKey(y, m, d);
						const monthPrefix = `${y}-${String(m + 1).padStart(2, '0')}`;
						const yearPrefix = `${y}`;
						const refresh = () => { saveTodos(); saveMarks(); self._renderTodos(panel); self._renderCalendar(panel); self._renderMarksSummary(panel); };

						if (action === 'del-day') {
							const snapTodos = JSON.parse(JSON.stringify(state.todos[dateKey] || []));
							const snapMarks = JSON.parse(JSON.stringify(state.marks[dateKey] || []));
							if (!snapTodos.length && !snapMarks.length) { toast('当日无数据'); return; }
							delete state.todos[dateKey]; delete state.marks[dateKey]; refresh();
							showUndoToast(`已删除 ${m+1}月${d}日 ${snapTodos.length}条待办 ${snapMarks.length}条标注`, () => { state.todos[dateKey] = snapTodos; state.marks[dateKey] = snapMarks; refresh(); });
						}
						if (action === 'del-month') {
							const todoKeys = Object.keys(state.todos).filter(k => k.startsWith(monthPrefix));
							const markKeys = Object.keys(state.marks).filter(k => k.startsWith(monthPrefix));
							if (!todoKeys.length && !markKeys.length) { toast('本月无数据'); return; }
							const snapT = {}, snapM = {}; let count = 0;
							todoKeys.forEach(k => { snapT[k] = JSON.parse(JSON.stringify(state.todos[k])); count += state.todos[k].length; delete state.todos[k]; });
							markKeys.forEach(k => { snapM[k] = JSON.parse(JSON.stringify(state.marks[k])); count += state.marks[k].length; delete state.marks[k]; });
							refresh();
							showUndoToast(`已删除 ${m+1}月 ${count} 条数据`, () => { Object.assign(state.todos, snapT); Object.assign(state.marks, snapM); refresh(); });
						}
						if (action === 'del-year') {
							const todoKeys = Object.keys(state.todos).filter(k => k.startsWith(yearPrefix));
							const markKeys = Object.keys(state.marks).filter(k => k.startsWith(yearPrefix));
							if (!todoKeys.length && !markKeys.length) { toast('本年无数据'); return; }
							const snapT = {}, snapM = {}; let count = 0;
							todoKeys.forEach(k => { snapT[k] = JSON.parse(JSON.stringify(state.todos[k])); count += state.todos[k].length; delete state.todos[k]; });
							markKeys.forEach(k => { snapM[k] = JSON.parse(JSON.stringify(state.marks[k])); count += state.marks[k].length; delete state.marks[k]; });
							refresh();
							showUndoToast(`已删除 ${y}年 ${count} 条数据`, () => { Object.assign(state.todos, snapT); Object.assign(state.marks, snapM); refresh(); });
						}
						if (action === 'del-all') {
							const total = Object.values(state.todos).reduce((s, a) => s + a.length, 0) + Object.values(state.marks).reduce((s, a) => s + a.length, 0);
							if (!total) { toast('无数据'); return; }
							const snapT = JSON.parse(JSON.stringify(state.todos));
							const snapM = JSON.parse(JSON.stringify(state.marks));
							state.todos = {}; state.marks = {}; refresh();
							showUndoToast(`已删除全部 ${total} 条数据`, () => { state.todos = snapT; state.marks = snapM; refresh(); });
						}
						if (action === 'export') {
							const data = { todos: state.todos, marks: state.marks };
							const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
							const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
							a.download = `omni-trail_schedule_${new Date().toISOString().slice(0,10)}.json`; a.click();
							toast('日程数据已导出');
						}
						if (action === 'import') {
							const inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.json';
							inp.onchange = ev => {
								const file = ev.target.files[0]; if (!file) return;
								const reader = new FileReader();
								reader.onload = () => {
									try {
										const imported = JSON.parse(reader.result);
										// 兼容纯待办格式和 {todos, marks} 格式
										if (imported.todos || imported.marks) {
											if (imported.todos) Object.entries(imported.todos).forEach(([k, v]) => {
												if (!state.todos[k]) state.todos[k] = v;
												else { const ids = new Set(state.todos[k].map(t => t.id)); v.forEach(t => { if (!ids.has(t.id)) state.todos[k].push(t); }); }
											});
											if (imported.marks) Object.entries(imported.marks).forEach(([k, v]) => {
												if (!state.marks[k]) state.marks[k] = v;
												else { const ids = new Set(state.marks[k].map(t => t.id)); v.forEach(t => { if (!ids.has(t.id)) state.marks[k].push(t); }); }
											});
										} else {
											// 纯待办格式
											Object.entries(imported).forEach(([k, v]) => { if (!Array.isArray(v)) throw 0; });
											Object.entries(imported).forEach(([k, v]) => {
												if (!state.todos[k]) state.todos[k] = v;
												else { const ids = new Set(state.todos[k].map(t => t.id)); v.forEach(t => { if (!ids.has(t.id)) state.todos[k].push(t); }); }
											});
										}
										refresh(); toast('日程数据已导入');
									} catch { toast('文件格式不正确'); }
								};
								reader.readAsText(file);
							};
							inp.click();
						}
					});
				}

				self._autoAdvanceMarks();
				self._updateViewToggle(panel);
				self._renderCalendar(panel);
			},

			_autoAdvanceMarks() {
				const today = new Date(); today.setHours(0, 0, 0, 0);
				let changed = false;
				Object.keys(state.marks).forEach(key => {
					const [y, m, d] = key.split('-').map(Number);
					const markDate = new Date(y, m - 1, d);
					if (markDate >= today) return;
					const marks = state.marks[key];
					marks.forEach((mark, idx) => {
						if (!mark.repeat || !mark.repeat.every || mark.repeat.every < 1) return;
						const { every, unit, calendar } = mark.repeat;
						let next;
						if (calendar === 'lunar' && mark.repeat.lunarMonth) {
							// 农历重复：基于农历日期逐年/月顺延
							let lY = y, lM = mark.repeat.lunarMonth, lD = mark.repeat.lunarDay;
							let safety = 0;
							while (safety++ < 1000) {
								const solar = lunarToSolar(lY, lM, lD, mark.repeat.lunarIsLeap);
								next = new Date(solar.y, solar.m - 1, solar.d);
								if (next >= today) break;
								if (unit === 'day') { lD += every; while (lD > 30) { lD -= 30; lM++; if (lM > 12) { lM -= 12; lY++; } } }
								else if (unit === 'month') { lM += every; while (lM > 12) { lM -= 12; lY++; } }
								else if (unit === 'year') { lY += every; }
							}
						} else {
							// 公历重复
							next = new Date(markDate);
							let safety = 0;
							while (next < today && safety++ < 1000) {
								if (unit === 'day') next.setDate(next.getDate() + every);
								else if (unit === 'month') { next.setMonth(next.getMonth() + every); clampDay(next); }
								else if (unit === 'year') { next.setFullYear(next.getFullYear() + every); clampDay(next); }
							}
						}
						if (next && next >= today) {
							const newKey = this._dateToKey(next.getFullYear(), next.getMonth(), next.getDate());
							if (newKey !== key) {
								if (!state.marks[newKey]) state.marks[newKey] = [];
								state.marks[newKey].push(mark);
								marks[idx] = null;
								changed = true;
							}
						}
					});
					const remaining = marks.filter(Boolean);
					if (remaining.length === 0) delete state.marks[key];
					else state.marks[key] = remaining;
				});
				if (changed) saveMarks();
			},

			_updateViewToggle(panel) {
				const btn = panel.querySelector('#cal-view-toggle');
				if (btn) btn.textContent = this._viewMode === 'month' ? '年' : '月';
				const gridBtn = panel.querySelector('#cal-grid-toggle');
				if (gridBtn) gridBtn.style.display = this._viewMode === 'year' ? '' : 'none';
				const calRight = panel.querySelector('.cal-right');
				const resizerEl = panel.querySelector('#cal-resizer');
				const calLeft = panel.querySelector('.cal-left');
				const mainArea = panel.querySelector('#cal-main-area');
				if (this._viewMode === 'year') {
					if (calRight) calRight.style.display = 'none';
					if (resizerEl) resizerEl.style.display = 'none';
					if (calLeft) calLeft.style.flex = '1 1 100%';
					if (mainArea) mainArea.style.flexShrink = '1';
				} else {
					if (calRight) calRight.style.display = '';
					if (resizerEl) resizerEl.style.display = '';
					if (calLeft) calLeft.style.flex = '';
					if (mainArea) mainArea.style.flexShrink = '0';
				}
			},

			onActivate(panel, { bottomBtn, footInfo }) {
				bottomBtn.innerHTML = `${I.plus} 添加标注`;
				bottomBtn.style.display = '';
				bottomBtn.onclick = () => this._openMarkPanel(panel);
				footInfo.textContent = '';
				if (this._viewMode === 'year') this._renderYearView(panel);
				else this._renderCalendar(panel);
			},

			_getScheduleDayOfWeek(schedule) {
				const map = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 0 };
				return map[schedule] ?? -1;
			},

			_showsOnDate(year, month, day) {
				const dow = new Date(year, month, day).getDay();
				return state.shows.filter(s => {
					if (!s.schedule || s.schedule === 'unset') return false;
					if (s.schedule === 'finished') return false;
					if (s.schedule === 'daily') return true;
					return this._getScheduleDayOfWeek(s.schedule) === dow;
				});
			},

			_dateToKey(y, m, d) {
				return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
			},

			_renderTodos(panel) {
				const dateKey = this._dateToKey(this._calendarYear, this._calendarMonth, this._selectedDay);
				const todos = state.todos[dateKey] || [];
				const marks = state.marks[dateKey] || [];
				const listEl = panel.querySelector('#cal-todo-list');
				const dateEl = panel.querySelector('#cal-todo-date');
				const countEl = panel.querySelector('#cal-todo-count');
				if (!listEl) return;

				const lunar = solarToLunar(this._calendarYear, this._calendarMonth + 1, this._selectedDay);
				dateEl.textContent = `${this._calendarMonth + 1}月${this._selectedDay}日 待办` + (lunar.month ? ` · ${lunar.month}${lunar.day}` : '');

				// 标注区域
				const marksBar = panel.querySelector('#cal-marks-bar');
				if (marksBar) {
					const today = new Date(); today.setHours(0,0,0,0);
					const targetDate = new Date(this._calendarYear, this._calendarMonth, this._selectedDay);
					const diffDays = Math.ceil((targetDate - today) / 86400000);
					const diffText = diffDays > 0 ? `还有${diffDays}天` : diffDays === 0 ? '就是今天' : `已过${-diffDays}天`;
					let marksHtml = `<button class="cal-mark-add" id="cal-mark-add-btn">${I.tag} 标注此日</button>`;
					marksHtml += marks.map(m =>
						`<div class="cal-mark-badge" style="background:${m.color || '#6366f1'}"><span>${escapeHTML(m.label)}${m.repeat && m.repeat.every ? ' 🔁' : ''} · ${diffText}</span><button class="cal-mark-del" data-mark-id="${m.id}" title="删除标注">×</button></div>`
					).join('');
					marksBar.innerHTML = marksHtml;
					marksBar.querySelectorAll('.cal-mark-del').forEach(btn => {
						btn.addEventListener('click', () => {
							state.marks[dateKey] = marks.filter(m => m.id !== btn.dataset.markId);
							if (!state.marks[dateKey].length) delete state.marks[dateKey];
							saveMarks(); this._renderTodos(panel); this._renderCalendar(panel); this._renderMarksSummary(panel);
						});
					});
					const addBtn = marksBar.querySelector('#cal-mark-add-btn');
					if (addBtn) addBtn.addEventListener('click', () => this._showMarkForm(panel));
				}

				if (!todos.length) {
					listEl.innerHTML = '<div class="cal-todo-empty">暂无待办，添加一个吧</div>';
					countEl.textContent = '';
					return;
				}

				const doneCount = todos.filter(t => t.done).length;
				countEl.textContent = `${doneCount}/${todos.length} 已完成`;

				listEl.innerHTML = todos.map(t =>
					`<div class="cal-todo-item${t.done ? ' done' : ''}" data-id="${t.id}"><input type="checkbox" class="cal-todo-cb" ${t.done ? 'checked' : ''}><span class="cal-todo-text">${escapeHTML(t.text)}</span><button class="cal-todo-del" title="删除">${I.x}</button></div>`
				).join('');

				listEl.querySelectorAll('.cal-todo-cb').forEach(cb => {
					cb.addEventListener('change', () => {
						const id = cb.closest('.cal-todo-item').dataset.id;
						const todo = todos.find(t => t.id === id);
						if (todo) { todo.done = cb.checked; saveTodos(); this._renderTodos(panel); }
					});
				});
				listEl.querySelectorAll('.cal-todo-del').forEach(btn => {
					btn.addEventListener('click', () => {
						const id = btn.closest('.cal-todo-item').dataset.id;
						state.todos[dateKey] = todos.filter(t => t.id !== id);
						saveTodos(); this._renderTodos(panel); this._renderCalendar(panel);
					});
				});
			},

			_showMarkForm(panel) {
				const marksBar = panel.querySelector('#cal-marks-bar');
				if (!marksBar || marksBar.querySelector('.cal-mark-form')) return;
				const COLORS = [{v:'#6366f1',n:'靛蓝'},{v:'#f472b6',n:'粉红'},{v:'#f59e0b',n:'琥珀'},{v:'#4ade80',n:'翠绿'},{v:'#38bdf8',n:'天蓝'},{v:'#f87171',n:'珊瑚红'},{v:'#a78bfa',n:'淡紫'}];
				const form = document.createElement('div');
				form.className = 'cal-mark-form';
				form.innerHTML = `<input type="text" id="mark-label-input" placeholder="标注文字" style="flex:1;min-width:0;"><select id="mark-color-select" style="width:auto;min-width:0;flex-shrink:1;font-size:calc(var(--font-size)*0.786);padding:5px 4px;">${COLORS.map(c=>`<option value="${c.v}" style="background:${c.v};color:#fff;">${c.n}</option>`).join('')}</select><span class="cal-mark-preview" id="cal-mark-preview" style="width:20px;height:20px;border-radius:50%;background:${COLORS[0].v};flex-shrink:0;display:inline-block;border:2px solid var(--border);"></span><button class="btn btn-primary" style="padding:5px 10px;font-size:calc(var(--font-size)*0.786);flex-shrink:0;">添加</button><button class="btn btn-ghost" style="padding:5px 8px;font-size:calc(var(--font-size)*0.786);flex-shrink:0;">取消</button>`;
				marksBar.appendChild(form);
				const input = form.querySelector('#mark-label-input');
				const colorSelect = form.querySelector('#mark-color-select');
				const colorPreview = form.querySelector('#cal-mark-preview');
				input.focus();
				colorSelect.addEventListener('change', () => { colorPreview.style.background = colorSelect.value; });
				form.querySelector('.btn-primary').addEventListener('click', () => {
					const label = input.value.trim();
					if (!label) { toast('请输入标注文字'); return; }
					const dateKey = this._dateToKey(this._calendarYear, this._calendarMonth, this._selectedDay);
					if (!state.marks[dateKey]) state.marks[dateKey] = [];
					state.marks[dateKey].push({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), label, color: colorSelect.value });
					saveMarks(); this._renderTodos(panel); this._renderCalendar(panel); this._renderMarksSummary(panel);
				});
				form.querySelector('.btn-ghost').addEventListener('click', () => form.remove());
				input.addEventListener('keydown', (e) => { if (e.key === 'Enter') form.querySelector('.btn-primary').click(); if (e.key === 'Escape') form.remove(); });
			},

			_renderMarksSummary(panel) {
				const listEl = panel.querySelector('#cal-marks-list');
				const countEl = panel.querySelector('#cal-marks-count');
				const summaryEl = panel.querySelector('#cal-marks-summary');
				if (!listEl) return;
				if (this._viewMode === 'year') { if (summaryEl) summaryEl.style.display = 'none'; return; }
				if (summaryEl) summaryEl.style.display = '';

				const today = new Date(); today.setHours(0, 0, 0, 0);
				const allMarks = [];
				Object.entries(state.marks).forEach(([key, marks]) => {
					const [y, m, d] = key.split('-').map(Number);
					const target = new Date(y, m - 1, d);
					const diff = Math.ceil((target - today) / 86400000);
					marks.forEach(mark => allMarks.push({ ...mark, dateKey: key, y, mo: m - 1, d, diff }));
				});
				allMarks.sort((a, b) => a.diff - b.diff);
				if (countEl) countEl.textContent = allMarks.length;
				if (!allMarks.length) { listEl.innerHTML = '<div style="padding:8px;font-size:calc(var(--font-size)*0.786);color:var(--muted);text-align:center;">暂无标注</div>'; return; }

				listEl.innerHTML = allMarks.map(m => {
					const diffText = m.diff > 0 ? `还有${m.diff}天` : m.diff === 0 ? '今天' : `已过${-m.diff}天`;
					return `<div class="cal-mark-row" data-y="${m.y}" data-m="${m.mo}" data-d="${m.d}"><span class="cal-mark-dot" style="background:${m.color || '#6366f1'}"></span><span class="cal-mark-label">${escapeHTML(m.label)}${m.repeat && m.repeat.every ? ' 🔁' : ''}</span><span class="cal-mark-date">${m.mo + 1}/${m.d}</span><span class="cal-mark-diff${m.diff <= 0 ? ' past' : ''}">${diffText}</span><button class="cal-mark-edit" data-mark-id="${m.id}" data-date-key="${m.dateKey}" title="编辑">${I.edit}</button></div>`;
				}).join('');

				listEl.querySelectorAll('.cal-mark-row').forEach(row => {
					row.addEventListener('click', (e) => {
						if (e.target.closest('.cal-mark-edit')) return;
						this._calendarYear = parseInt(row.dataset.y);
						this._calendarMonth = parseInt(row.dataset.m);
						this._selectedDay = parseInt(row.dataset.d);
						this._renderCalendar(panel);
					});
				});
				listEl.querySelectorAll('.cal-mark-edit').forEach(btn => {
					btn.addEventListener('click', (e) => {
						e.stopPropagation();
						const markId = btn.dataset.markId;
						const dateKey = btn.dataset.dateKey;
						const mark = (state.marks[dateKey] || []).find(m => m.id === markId);
						if (mark) this._openMarkPanel(panel, mark, dateKey);
					});
				});

				// 动态高度：用 cal-left 总高减去其他区域
				const calLeft = panel.querySelector('.cal-left');
				const calHeader = calLeft?.querySelector('.cal-header');
				const gridEl = panel.querySelector('#cal-main-area');
				const showsEl2 = panel.querySelector('#cal-shows');
				const summaryHeader = panel.querySelector('.cal-marks-header');
				if (calLeft && gridEl) {
					const totalH = calLeft.offsetHeight;
					const headerH = calHeader ? calHeader.offsetHeight : 0;
					const gridH = gridEl.offsetHeight;
					const summaryHeaderH = summaryHeader ? summaryHeader.offsetHeight : 0;
					const showsH = showsEl2 ? showsEl2.offsetHeight : 0;
					// 28px: cal-left padding(24) + marks-summary border/margin(4)
					const available = totalH - headerH - gridH - summaryHeaderH - showsH - 28;
					listEl.style.maxHeight = Math.max(60, available) + 'px';
				}
			},

			_openMarkPanel(panel, existingMark, editDateKey) {
				if (!this._app) { toast('初始化中，请稍后重试'); return; }
				const isEdit = !!existingMark;
				const COLORS = [{v:'#6366f1',n:'靛蓝'},{v:'#f472b6',n:'粉红'},{v:'#f59e0b',n:'琥珀'},{v:'#4ade80',n:'翠绿'},{v:'#38bdf8',n:'天蓝'},{v:'#f87171',n:'珊瑚红'},{v:'#a78bfa',n:'淡紫'}];
				const LUNAR_MONTH_NAMES = ['正','二','三','四','五','六','七','八','九','十','冬','腊'];
				const LUNAR_DAY_NAMES = ['初一','初二','初三','初四','初五','初六','初七','初八','初九','初十','十一','十二','十三','十四','十五','十六','十七','十八','十九','二十','廿一','廿二','廿三','廿四','廿五','廿六','廿七','廿八','廿九','三十'];
				const now = new Date();
				const curYear = now.getFullYear();
				const initColor = existingMark?.color || COLORS[0].v;

				// 编辑模式：解析已有日期
				let initSolarY = curYear, initSolarM = now.getMonth() + 1, initSolarD = now.getDate();
				if (isEdit && editDateKey) {
					const parts = editDateKey.split('-').map(Number);
					initSolarY = parts[0]; initSolarM = parts[1]; initSolarD = parts[2];
				}

				const yearOpts = Array.from({length: 11}, (_, i) => curYear - 5 + i);
				const monthOpts = Array.from({length: 12}, (_, i) => i + 1);

				const { ov, panel: editPanel } = this._app.makeOverlay('mark-panel', `
					<div class="panel-head">
						<div class="head-logo">${I.tag}</div>
						<h2>${isEdit ? '编辑标注' : '添加标注'}</h2>
						<button class="btn-icon" id="mp-close">${I.x}</button>
					</div>
					<div class="panel-body">
						<div class="form-group">
							<label class="form-label required">事件名称</label>
							<input type="text" id="mp-label" placeholder="如：生日、考试、旅行…" value="${isEdit ? escapeHTML(existingMark.label) : ''}">
						</div>
						<div class="form-group">
							<label class="form-label">目标日期模式</label>
							<div style="display:flex;gap:8px;">
								<label><input type="radio" name="mp-mode" value="solar" checked> 公历</label>
								<label><input type="radio" name="mp-mode" value="lunar"> 农历</label>
							</div>
						</div>
						<div class="form-group" id="mp-solar-group">
							<label class="form-label">公历日期</label>
							<div style="display:flex;gap:6px;">
								<div class="cust-dd" id="mp-solar-year" style="flex:1.6;"></div>
								<div class="cust-dd" id="mp-solar-month" style="flex:0.7;"></div>
								<div class="cust-dd" id="mp-solar-day" style="flex:0.7;"></div>
							</div>
						</div>
						<div class="form-group" id="mp-lunar-group" style="display:none;">
							<label class="form-label">农历日期</label>
							<div style="display:flex;gap:6px;">
								<div class="cust-dd" id="mp-lunar-year" style="flex:2;"></div>
								<div class="cust-dd" id="mp-lunar-month" style="flex:0.6;"></div>
								<div class="cust-dd" id="mp-lunar-day" style="flex:0.6;"></div>
							</div>
						</div>
						<div class="form-group">
							<label class="form-label">颜色</label>
							<div style="display:flex;align-items:center;gap:8px;">
								<select id="mp-color" style="flex:1;">${COLORS.map(c => `<option value="${c.v}" ${c.v===initColor?'selected':''}>${c.n}</option>`).join('')}</select>
								<span id="mp-color-preview" style="width:24px;height:24px;border-radius:50%;background:${initColor};flex-shrink:0;border:2px solid var(--border);"></span>
							</div>
						</div>
						<div class="form-group">
							<label class="form-label">重复规则</label>
							<div style="display:flex;gap:6px;">
								<div class="cust-dd" id="mp-repeat-every" style="flex:1;"></div>
								<div class="cust-dd" id="mp-repeat-unit" style="flex:0.7;"></div>
								<div class="cust-dd" id="mp-repeat-calendar" style="flex:0.7;"></div>
							</div>
						</div>
					</div>
					<div class="panel-foot">
						${isEdit ? `<button class="btn btn-danger" id="mp-delete">${I.trash} 删除</button>` : ''}
						<button class="btn btn-ghost" id="mp-cancel">取消</button>
						<button class="btn btn-primary ml-auto" id="mp-save">${I.check} 保存</button>
					</div>
				`, { panelClass: ' edit-panel' });

				const labelInput = editPanel.querySelector('#mp-label');
				const solarGroup = editPanel.querySelector('#mp-solar-group');
				const lunarGroup = editPanel.querySelector('#mp-lunar-group');
				const colorSel = editPanel.querySelector('#mp-color');
				const colorPreview = editPanel.querySelector('#mp-color-preview');
				const overlayEl = editPanel.closest('.overlay') || editPanel.parentNode;

				colorSel.addEventListener('change', () => { colorPreview.style.background = colorSel.value; });

				// 自定义下拉（统一向下弹出，fixed 定位避免 overflow 裁切）
				function _mkDD(sel, opts, initVal, onChange) {
					const el = editPanel.querySelector(sel);
					if (!el) return { get value() { return String(initVal); }, set value(_) {}, setOpts() {} };
					el.style.position = 'relative';
					let val = String(initVal);
					const btn = document.createElement('button');
					btn.type = 'button'; btn.className = 'cust-dd-btn';
					const list = document.createElement('div');
					list.className = 'cust-dd-list';
					overlayEl.appendChild(list);
					el.appendChild(btn);
					const findLabel = (v) => { const o = opts.find(o => String(o.v) === String(v)); return o ? o.t : String(v); };
					btn.textContent = findLabel(val);
					const positionList = () => { const r = btn.getBoundingClientRect(); list.style.left = r.left + 'px'; list.style.top = (r.bottom + 2) + 'px'; list.style.width = r.width + 'px'; };
					const closeList = () => { list.classList.remove('open'); btn.classList.remove('open'); };
					const renderList = (options) => {
						list.innerHTML = '';
						options.forEach(o => {
							const d = document.createElement('div');
							d.className = 'cust-dd-opt' + (String(o.v) === val ? ' active' : '');
							d.textContent = o.t; d.dataset.v = String(o.v);
							d.addEventListener('click', () => { val = String(o.v); btn.textContent = o.t; closeList(); list.querySelectorAll('.cust-dd-opt').forEach(x => x.classList.toggle('active', x.dataset.v === val)); if (onChange) onChange(); });
							list.appendChild(d);
						});
					};
					renderList(opts);
					btn.addEventListener('click', (e) => {
						e.stopPropagation();
						const opening = !list.classList.contains('open');
						overlayEl.querySelectorAll('.cust-dd-list.open').forEach(l => l.classList.remove('open'));
						overlayEl.querySelectorAll('.cust-dd-btn.open').forEach(b => b.classList.remove('open'));
						if (opening) { positionList(); list.classList.add('open'); btn.classList.add('open'); }
					});
					editPanel.querySelector('.panel-body')?.addEventListener('scroll', () => { if (list.classList.contains('open')) positionList(); });
					return {
						get value() { return val; },
						set value(v) { val = String(v); btn.textContent = findLabel(val); list.querySelectorAll('.cust-dd-opt').forEach(x => x.classList.toggle('active', x.dataset.v === val)); },
						setOpts(nOpts, nLabel) { opts = nOpts; btn.textContent = nLabel || findLabel(val); renderList(opts); }
					};
				}

				var solarYearDD, solarMonthDD, solarDayDD, lunarYearDD, lunarMonthDD, lunarDayDD;
				function updateSolarDays() {
					const y = parseInt(solarYearDD.value), m = parseInt(solarMonthDD.value);
					const days = new Date(y, m, 0).getDate();
					const cur = parseInt(solarDayDD.value) || 1;
					const opts = Array.from({length: days}, (_, i) => ({v: i+1, t: (i+1)+'日'}));
					solarDayDD.setOpts(opts, Math.min(cur, days) + '日');
					solarDayDD.value = Math.min(cur, days);
				}
				function updateLunarMonths() {
					const y = parseInt(lunarYearDD.value);
					const leap = getLeapMonth(y);
					let opts = [];
					for (let m = 1; m <= 12; m++) {
						opts.push({v: 'N'+m, t: LUNAR_MONTH_NAMES[m-1] + '月'});
						if (m === leap) opts.push({v: 'L'+m, t: '闰' + LUNAR_MONTH_NAMES[m-1] + '月'});
					}
					const cur = lunarMonthDD.value || 'N1';
					lunarMonthDD.setOpts(opts, (opts.find(o => o.v === cur) || {}).t || '正月');
					lunarMonthDD.value = cur;
					updateLunarDays();
				}
				function updateLunarDays() {
					const y = parseInt(lunarYearDD.value);
					const mv = lunarMonthDD.value;
					const isLeap = mv.charAt(0) === 'L';
					const m = parseInt(mv.slice(1));
					const days = isLeap ? leapMonthDays(y) : monthDayCount(y, m);
					const cur = parseInt(lunarDayDD.value) || 1;
					const opts = Array.from({length: days}, (_, i) => ({v: i+1, t: LUNAR_DAY_NAMES[i]}));
					lunarDayDD.setOpts(opts, LUNAR_DAY_NAMES[Math.min(cur, days) - 1] || '初一');
					lunarDayDD.value = Math.min(cur, days);
				}

				solarYearDD = _mkDD('#mp-solar-year', yearOpts.map(y => ({v: y, t: y + '年'})), initSolarY, updateSolarDays);
				solarMonthDD = _mkDD('#mp-solar-month', monthOpts.map(m => ({v: m, t: m + '月'})), initSolarM, updateSolarDays);
				solarDayDD = _mkDD('#mp-solar-day', [], initSolarD);
				updateSolarDays();
				if (isEdit) solarDayDD.value = initSolarD;

				const lunarYearOpts = yearOpts.map(y => ({v: y, t: y + '（' + HEAVENLY_STEMS[(y-4)%10] + EARTHLY_BRANCHES[(y-4)%12] + ZODIAC_ANIMALS[(y-4)%12] + '年）'}));
				lunarYearDD = _mkDD('#mp-lunar-year', lunarYearOpts, curYear, updateLunarMonths);
				lunarMonthDD = _mkDD('#mp-lunar-month', [{v:'N1',t:'正月'}], 'N1', updateLunarDays);
				lunarDayDD = _mkDD('#mp-lunar-day', [{v:1,t:'初一'}], 1);
				updateLunarMonths();

				// 重复规则下拉
				const initRepeatEvery = isEdit && existingMark.repeat ? existingMark.repeat.every : 0;
				const initRepeatUnit = isEdit && existingMark.repeat ? existingMark.repeat.unit : 'none';
				const initRepeatCal = isEdit && existingMark.repeat ? (existingMark.repeat.calendar || 'solar') : 'solar';
				const repeatEveryOpts = [{v:0,t:'不重复'}].concat(Array.from({length:99},(_, i) => ({v:i+1,t:`每${i+1}`})));
				const repeatUnitOpts = [{v:'none',t:'——'},{v:'day',t:'天'},{v:'month',t:'月'},{v:'year',t:'年'}];
				const repeatCalendarDD = _mkDD('#mp-repeat-calendar', [{v:'solar',t:'公历'},{v:'lunar',t:'农历'}], initRepeatCal);
				const repeatUnitDD = _mkDD('#mp-repeat-unit', repeatUnitOpts, initRepeatUnit);
				const repeatEveryDD = _mkDD('#mp-repeat-every', repeatEveryOpts, initRepeatEvery, () => {
					const ev = parseInt(repeatEveryDD.value);
					if (ev === 0) { repeatUnitDD.value = 'none'; }
					else if (repeatUnitDD.value === 'none') { repeatUnitDD.value = 'day'; }
				});

				editPanel.querySelectorAll('input[name="mp-mode"]').forEach(radio => {
					radio.addEventListener('change', () => {
						const isLunar = radio.value === 'lunar' && radio.checked;
						solarGroup.style.display = isLunar ? 'none' : '';
						lunarGroup.style.display = isLunar ? '' : 'none';
						// 切换时自动对应转换日期
						if (isLunar) {
							// 公历 → 农历
							const sY = parseInt(solarYearDD.value), sM = parseInt(solarMonthDD.value), sD = parseInt(solarDayDD.value);
							const lunar = solarToLunar(sY, sM, sD);
							if (lunar && lunar.lunarYear) {
								lunarYearDD.value = lunar.lunarYear;
								updateLunarMonths();
								const monthIdx = LUNAR_MONTH_NAMES.indexOf(lunar.month.replace('闰', '').replace('月', ''));
								const isLeap = lunar.month.startsWith('闰');
								const mv = (isLeap ? 'L' : 'N') + (monthIdx + 1);
								lunarMonthDD.value = mv;
								updateLunarDays();
								const dayIdx = LUNAR_DAY_NAMES.indexOf(lunar.day);
								lunarDayDD.value = dayIdx >= 0 ? dayIdx + 1 : 1;
							}
						} else {
							// 农历 → 公历
							const lY = parseInt(lunarYearDD.value);
							const mv = lunarMonthDD.value;
							const isLeap = mv.startsWith('L');
							const lM = parseInt(mv.slice(1));
							const lD = parseInt(lunarDayDD.value);
							const solar = lunarToSolar(lY, lM, lD, isLeap);
							if (solar) {
								solarYearDD.value = solar.y;
								updateSolarDays();
								solarMonthDD.value = solar.m;
								updateSolarDays();
								solarDayDD.value = solar.d;
							}
						}
					});
				});

				const _globalCloseDD = (e) => {
					if (!e.target.closest('.cust-dd') && !e.target.closest('.cust-dd-list')) {
						overlayEl.querySelectorAll('.cust-dd-list.open').forEach(l => l.classList.remove('open'));
						overlayEl.querySelectorAll('.cust-dd-btn.open').forEach(b => b.classList.remove('open'));
					}
				};
				overlayEl.addEventListener('mousedown', _globalCloseDD);
				const close = () => {
					overlayEl.querySelectorAll('.cust-dd-list').forEach(l => l.remove());
					overlayEl.removeEventListener('mousedown', _globalCloseDD);
					this._app.closeOverlay('mark-panel');
				};
				editPanel.querySelector('#mp-close').onclick = close;
				editPanel.querySelector('#mp-cancel').onclick = close;

				// 删除按钮（编辑模式）
				if (isEdit) {
					editPanel.querySelector('#mp-delete').onclick = () => {
						const marks = state.marks[editDateKey] || [];
						const idx = marks.findIndex(m => m.id === existingMark.id);
						if (idx >= 0) {
							const removed = marks.splice(idx, 1)[0];
							if (!marks.length) delete state.marks[editDateKey];
							saveMarks(); close();
							this._renderTodos(panel); this._renderCalendar(panel); this._renderMarksSummary(panel);
							showUndoToast(`已删除标注「${removed.label}」`, () => {
								if (!state.marks[editDateKey]) state.marks[editDateKey] = [];
								state.marks[editDateKey].push(removed);
								saveMarks();
								this._renderTodos(panel); this._renderCalendar(panel); this._renderMarksSummary(panel);
							});
						}
					};
				}

				// 保存
				editPanel.querySelector('#mp-save').onclick = () => {
					const label = labelInput.value.trim();
					if (!label) { toast('请输入事件名称'); return; }

					// 计算目标日期 key
					const mode = editPanel.querySelector('input[name="mp-mode"]:checked').value;
					let newDateKey;
					if (mode === 'solar') {
						const y = parseInt(solarYearDD.value);
						const m = parseInt(solarMonthDD.value) - 1;
						const d = parseInt(solarDayDD.value);
						newDateKey = this._dateToKey(y, m, d);
					} else {
						const lY = parseInt(lunarYearDD.value);
						const mv = lunarMonthDD.value;
						const isLeap = mv.startsWith('L');
						const lM = parseInt(mv.slice(1));
						const lD = parseInt(lunarDayDD.value);
						const solar = lunarToSolar(lY, lM, lD, isLeap);
						newDateKey = this._dateToKey(solar.y, solar.m - 1, solar.d);
					}

					if (isEdit) {
						// 编辑模式：从旧日期移除，添加到新日期
						const oldMarks = state.marks[editDateKey] || [];
						const idx = oldMarks.findIndex(m => m.id === existingMark.id);
						if (idx >= 0) oldMarks.splice(idx, 1);
						if (!oldMarks.length) delete state.marks[editDateKey];
						if (!state.marks[newDateKey]) state.marks[newDateKey] = [];
						const repeatVal = parseInt(repeatEveryDD.value);
						const repUnit = repeatUnitDD.value;
						let repeat = repeatVal > 0 && repUnit !== 'none' ? { every: repeatVal, unit: repUnit } : null;
						if (repeat && repeatCalendarDD.value === 'lunar') {
							const lmVal = lunarMonthDD.value;
							repeat.calendar = 'lunar';
							repeat.lunarMonth = parseInt(lmVal.slice(1));
							repeat.lunarIsLeap = lmVal.startsWith('L');
							repeat.lunarDay = parseInt(lunarDayDD.value);
						}
						state.marks[newDateKey].push({ id: existingMark.id, label, color: colorSel.value, repeat });
						saveMarks(); close();
						this._renderTodos(panel); this._renderCalendar(panel); this._renderMarksSummary(panel);
						toast(`已更新「${label}」`);
					} else {
						// 添加模式
						if (!state.marks[newDateKey]) state.marks[newDateKey] = [];
						const repeatVal = parseInt(repeatEveryDD.value);
						const repUnit = repeatUnitDD.value;
						let repeat = repeatVal > 0 && repUnit !== 'none' ? { every: repeatVal, unit: repUnit } : null;
						if (repeat && repeatCalendarDD.value === 'lunar') {
							const lmVal = lunarMonthDD.value;
							repeat.calendar = 'lunar';
							repeat.lunarMonth = parseInt(lmVal.slice(1));
							repeat.lunarIsLeap = lmVal.startsWith('L');
							repeat.lunarDay = parseInt(lunarDayDD.value);
						}
						state.marks[newDateKey].push({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), label, color: colorSel.value, repeat });
						saveMarks(); close();
						this._renderTodos(panel); this._renderCalendar(panel); this._renderMarksSummary(panel);
						toast(`已标注「${label}」`);
					}
				};
				labelInput.focus();
			},

			// ── 月视图 ──
			_renderCalendar(panel) {
				const area = panel.querySelector('#cal-main-area');
				const yearBtn = panel.querySelector('#cal-year-btn');
				const monthBtn = panel.querySelector('#cal-month-btn');
				const showsEl = panel.querySelector('#cal-shows');
				if (!area) return;
				if (showsEl) showsEl.style.display = '';
				const y = this._calendarYear, m = this._calendarMonth;
				if (yearBtn) yearBtn.textContent = y;
				if (monthBtn) monthBtn.textContent = m + 1;
				const ws = state.settings.weekStart || 0;
				const firstDay0 = new Date(y, m, 1).getDay();
				const firstDay = ws === 1 ? (firstDay0 + 6) % 7 : firstDay0;
				const daysInMonth = new Date(y, m + 1, 0).getDate();
				const daysInPrev = new Date(y, m, 0).getDate();
				const today = new Date();
				const todayStr = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
				const weekdays = ws === 1 ? ['一','二','三','四','五','六','日'] : ['日','一','二','三','四','五','六'];
				let html = '<div class="cal-grid">' + weekdays.map(d => `<div class="cal-weekday">${d}</div>`).join('');
				for (let i = firstDay - 1; i >= 0; i--) {
					html += `<div class="cal-day other"><span class="cal-day-num">${daysInPrev - i}</span></div>`;
				}
				for (let d = 1; d <= daysInMonth; d++) {
					const isToday = `${y}-${m}-${d}` === todayStr;
					const isSelected = d === this._selectedDay && y === this._calendarYear && m === this._calendarMonth;
					const shows = this._showsOnDate(y, m, d);
					const dateKey = this._dateToKey(y, m, d);
					const hasTodos = (state.todos[dateKey] || []).length > 0;
					const hasMarks = (state.marks[dateKey] || []).length > 0;
					const cls = ['cal-day'];
					if (isToday) cls.push('today');
					if (isSelected) cls.push('selected');
					if (shows.length) cls.push('has-show');
					if (hasTodos) cls.push('has-todo');
					if (hasMarks) cls.push('has-mark');
					const title = shows.length ? shows.map(s => s.name).join(', ') : '';
					const markLabels = (state.marks[dateKey] || []).map(m => m.label).join(', ');
					const fullTitle = [title, markLabels ? '📌 ' + markLabels : ''].filter(Boolean).join(' | ');
					const lunar = solarToLunar(y, m + 1, d);
					// 节日检测：公历 → 农历
					const SOLAR_FEST = {'1-1':'元旦','2-14':'情人节','3-8':'妇女节','5-1':'劳动节','5-4':'青年节','6-1':'儿童节','7-1':'建党节','8-1':'建军节','9-10':'教师节','10-1':'国庆节','12-25':'圣诞节'};
					const LUNAR_FEST = {'1-1':'春节','1-15':'元宵节','2-2':'龙抬头','5-5':'端午节','7-7':'七夕节','7-15':'中元节','8-15':'中秋节','9-9':'重阳节','12-8':'腊八节','12-23':'小年','12-30':'除夕'};
					const solarKey = (m + 1) + '-' + d;
					const lmNum = LUNAR_MONTH_NAMES.indexOf(lunar.month.replace('闰', '').replace('月', '')) + 1;
					const ldNum = LUNAR_DAY_NAMES.indexOf(lunar.day) + 1;
					const lunarKey = lmNum + '-' + ldNum;
					const holiday = SOLAR_FEST[solarKey] || LUNAR_FEST[lunarKey] || null;
					let lunarText, lunarCls;
					if (holiday) {
						lunarText = holiday;
						lunarCls = 'cal-day-lunar holiday';
					} else if (lunar.isFirstDay) {
						lunarText = lunar.month;
						lunarCls = 'cal-day-lunar first-day';
					} else {
						lunarText = lunar.day;
						lunarCls = 'cal-day-lunar';
					}
					html += `<div class="${cls.join(' ')}" data-day="${d}" title="${escapeHTML(fullTitle)}"><span class="cal-day-num">${d}</span><span class="${lunarCls}">${lunarText}</span></div>`;
				}
				const totalCells = firstDay + daysInMonth;
				const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
				for (let d = 1; d <= remaining; d++) {
					html += `<div class="cal-day other"><span class="cal-day-num">${d}</span></div>`;
				}
				html += '</div>';
				area.innerHTML = html;
				if (showsEl) {
					const showsContent = panel.querySelector('#cal-shows-content');
					const todayShows = this._showsOnDate(today.getFullYear(), today.getMonth(), today.getDate());
					if (showsContent) {
						if (todayShows.length) { showsContent.innerHTML = `更新剧集: ${todayShows.map(s => `<strong>${escapeHTML(s.name)}</strong>`).join('、')}`; }
						else { showsContent.textContent = '今日无追剧更新'; }
					}
				}
				const self = this;
				area.querySelectorAll('.cal-day:not(.other)').forEach(el => {
					el.addEventListener('click', () => {
						area.querySelectorAll('.cal-day').forEach(c => c.classList.remove('selected'));
						el.classList.add('selected');
						self._selectedDay = parseInt(el.dataset.day);
						self._renderTodos(panel);
					});
				});
				this._renderTodos(panel);
				this._renderMarksSummary(panel);
			},

			// ── 年视图 ──
			_renderYearView(panel) {
				const area = panel.querySelector('#cal-main-area');
				const yearBtn = panel.querySelector('#cal-year-btn');
				const monthBtn = panel.querySelector('#cal-month-btn');
				const showsEl = panel.querySelector('#cal-shows');
				if (!area) return;
				const y = this._calendarYear;
				if (yearBtn) yearBtn.textContent = y;
				if (monthBtn) monthBtn.textContent = '';
				if (showsEl) showsEl.style.display = 'none';
				const today = new Date();
				const todayStr = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
				const ws = state.settings.weekStart || 0;
				const weekdays = ws === 1 ? ['一','二','三','四','五','六','日'] : ['日','一','二','三','四','五','六'];
				let html = `<div class="cal-year-grid" style="grid-template-columns:repeat(${this._yearGridCols},1fr);">`;
				for (let m = 0; m < 12; m++) {
					html += `<div class="cal-mini-month"><div class="cal-mini-month-title" data-month="${m}">${m + 1}月</div>`;
					html += '<div class="cal-mini-grid">' + weekdays.map(d => `<div class="cal-mini-weekday">${d}</div>`).join('');
					const firstDay0 = new Date(y, m, 1).getDay();
					const firstDay = ws === 1 ? (firstDay0 + 6) % 7 : firstDay0;
					const daysInMonth = new Date(y, m + 1, 0).getDate();
					const daysInPrev = new Date(y, m, 0).getDate();
					for (let i = firstDay - 1; i >= 0; i--) {
						html += `<div class="cal-mini-day other">${daysInPrev - i}</div>`;
					}
					for (let d = 1; d <= daysInMonth; d++) {
						const isToday = `${y}-${m}-${d}` === todayStr;
						const shows = this._showsOnDate(y, m, d);
						const dateKey = this._dateToKey(y, m, d);
						const hasTodos = (state.todos[dateKey] || []).length > 0;
						const hasMarks = (state.marks[dateKey] || []).length > 0;
						const cls = ['cal-mini-day', 'clickable'];
						if (isToday) cls.push('today');
						if (shows.length) cls.push('has-show');
						if (hasTodos) cls.push('has-todo');
						if (hasMarks) cls.push('has-mark');
						// 农历 / 节日
						const lunar = solarToLunar(y, m + 1, d);
						const SOLAR_FEST = {'1-1':'元旦','2-14':'情人节','3-8':'妇女节','5-1':'劳动节','5-4':'青年节','6-1':'儿童节','7-1':'建党节','8-1':'建军节','9-10':'教师节','10-1':'国庆节','12-25':'圣诞节'};
						const LUNAR_FEST = {'1-1':'春节','1-15':'元宵节','2-2':'龙抬头','5-5':'端午节','7-7':'七夕节','7-15':'中元节','8-15':'中秋节','9-9':'重阳节','12-8':'腊八节','12-23':'小年','12-30':'除夕'};
						const lmNum = LUNAR_MONTH_NAMES.indexOf(lunar.month.replace('闰', '').replace('月', '')) + 1;
						const ldNum = LUNAR_DAY_NAMES.indexOf(lunar.day) + 1;
						const solarKey = (m + 1) + '-' + d;
						const lunarKey = lmNum + '-' + ldNum;
						const festival = SOLAR_FEST[solarKey] || LUNAR_FEST[lunarKey];
						const lunarText = festival || (lunar.isFirstDay ? lunar.month : lunar.day);
						const lunarCls = festival ? 'cal-mini-lunar festival' : 'cal-mini-lunar';
						html += `<div class="${cls.join(' ')}" data-month="${m}" data-day="${d}"><span>${d}</span><span class="${lunarCls}">${lunarText}</span></div>`;
					}
					const totalCells = firstDay + daysInMonth;
					const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
					for (let d = 1; d <= remaining; d++) html += `<div class="cal-mini-day other">${d}</div>`;
					html += '</div></div>';
				}
				html += '</div>';
				area.innerHTML = html;
				const self = this;
				area.querySelectorAll('.cal-mini-month-title').forEach(el => {
					el.addEventListener('click', () => {
						self._calendarMonth = parseInt(el.dataset.month);
						self._selectedDay = 1;
						self._viewMode = 'month';
						self._updateViewToggle(panel);
						self._renderCalendar(panel);
					});
				});
				area.querySelectorAll('.cal-mini-day.clickable').forEach(el => {
					el.addEventListener('click', () => {
						self._calendarMonth = parseInt(el.dataset.month);
						self._selectedDay = parseInt(el.dataset.day);
						self._viewMode = 'month';
						self._updateViewToggle(panel);
						self._renderCalendar(panel);
					});
				});
			},

			// ── 年份选择器 ──
			_showYearPicker(panel, anchor) {
				this._closePickers(panel);
				const self = this;
				const picker = document.createElement('div');
				picker.className = 'cal-picker';
				let baseYear = self._calendarYear - 5;
				const render = () => {
					let html = '<div class="cal-picker-head"><button id="yp-prev">◀</button><span>' + baseYear + '-' + (baseYear + 11) + '</span><button id="yp-next">▶</button></div><div class="cal-picker-grid">';
					for (let i = 0; i < 12; i++) {
						const yr = baseYear + i;
						html += `<button class="cal-picker-btn${yr === self._calendarYear ? ' active' : ''}" data-year="${yr}">${yr}</button>`;
					}
					html += '</div>';
					picker.innerHTML = html;
					picker.querySelector('#yp-prev')?.addEventListener('click', (e) => { e.stopPropagation(); baseYear -= 12; render(); });
					picker.querySelector('#yp-next')?.addEventListener('click', (e) => { e.stopPropagation(); baseYear += 12; render(); });
					picker.querySelectorAll('.cal-picker-btn').forEach(btn => {
						btn.addEventListener('click', (e) => {
							e.stopPropagation();
							self._calendarYear = parseInt(btn.dataset.year);
							self._closePickers(panel);
							if (self._viewMode === 'year') self._renderYearView(panel);
							else self._renderCalendar(panel);
						});
					});
				};
				render();
				const rect = anchor.getBoundingClientRect();
				const panelRect = panel.getBoundingClientRect();
				picker.style.left = (rect.left - panelRect.left) + 'px';
				picker.style.top = (rect.bottom - panelRect.top + 4) + 'px';
				panel.appendChild(picker);
				const shadowRoot = panel.getRootNode();
				setTimeout(() => { const close = (e) => { if (!picker.contains(e.target) && e.target !== anchor) { self._closePickers(panel); shadowRoot.removeEventListener('mousedown', close); } }; shadowRoot.addEventListener('mousedown', close); }, 0);
			},

			// ── 月份选择器 ──
			_showMonthPicker(panel, anchor) {
				this._closePickers(panel);
				const self = this;
				const picker = document.createElement('div');
				picker.className = 'cal-picker';
				let html = '<div class="cal-picker-grid">';
				for (let i = 0; i < 12; i++) {
					html += `<button class="cal-picker-btn${i === self._calendarMonth ? ' active' : ''}" data-month="${i}">${i + 1}月</button>`;
				}
				html += '</div>';
				picker.innerHTML = html;
				picker.querySelectorAll('.cal-picker-btn').forEach(btn => {
					btn.addEventListener('click', (e) => {
						e.stopPropagation();
						self._calendarMonth = parseInt(btn.dataset.month);
						self._closePickers(panel);
						self._viewMode = 'month';
						self._updateViewToggle(panel);
						self._renderCalendar(panel);
					});
				});
				const rect = anchor.getBoundingClientRect();
				const panelRect = panel.getBoundingClientRect();
				picker.style.left = (rect.left - panelRect.left) + 'px';
				picker.style.top = (rect.bottom - panelRect.top + 4) + 'px';
				panel.appendChild(picker);
				const shadowRoot = panel.getRootNode();
				setTimeout(() => { const close = (e) => { if (!picker.contains(e.target) && e.target !== anchor) { self._closePickers(panel); shadowRoot.removeEventListener('mousedown', close); } }; shadowRoot.addEventListener('mousedown', close); }, 0);
			},

			_closePickers(panel) {
				panel.querySelectorAll('.cal-picker').forEach(p => p.remove());
			},
		},
		videoparse: {
			label: TAB_LABELS.videoparse,
			buildContent() {
				const parsers = state.settings.videoParsers || DEFAULT_VIDEO_PARSERS;
				const activeIdx = state.settings.videoDefaultParser || 0;
				const playMode = state.settings.videoPlayMode || 'newtab';
				const siteDetected = detectVideoSite();

				const sourceButtons = parsers.filter(p => p.enabled !== false).map((p, i) => {
					const realIdx = parsers.indexOf(p);
					return `<button class="vp-source-btn${realIdx === activeIdx ? ' active' : ''}" data-idx="${realIdx}">${escapeHTML(p.name)}</button>`;
				}).join('');

				return `
					<div class="vp-wrap">
						<div>
							<div class="vp-section-title">视频地址</div>
							<div class="vp-input-row">
								<input type="text" id="vp-url" placeholder="粘贴视频页面 URL…" value="${siteDetected ? escapeHTML(location.href) : ''}">
								<button class="btn btn-primary" id="vp-parse">${I.play} 解析播放</button>
							</div>
						</div>

						<div>
							<div class="vp-section-title">解析源（${parsers.filter(p => p.enabled !== false).length} 个可用）</div>
							<div class="vp-source-grid" id="vp-sources">${sourceButtons}</div>
							<div style="margin-top:8px;display:flex;gap:6px;align-items:center;">
								<button class="vp-action-btn" id="vp-manage-sources">${I.edit} 管理解析源</button>
								<button class="vp-action-btn" id="vp-test-sources">${I.zap} 检测源延迟</button>
							</div>
						</div>

						<div>
							<div class="vp-section-title">播放方式</div>
							<div class="vp-mode-row">
								<label><input type="radio" name="vp-mode" value="newtab" ${playMode === 'newtab' ? 'checked' : ''}> 新标签页打开</label>
								<label><input type="radio" name="vp-mode" value="iframe" ${playMode === 'iframe' ? 'checked' : ''}> 面板内播放</label>
								<label id="vp-inject-label"><input type="radio" name="vp-mode" value="inject" ${playMode === 'inject' ? 'checked' : ''}> 页面注入</label>
							</div>
							<div id="vp-inject-hint" class="vp-tip" style="margin-top:4px;display:${playMode === 'inject' ? 'block' : 'none'};">将解析后的播放器替换当前页面的原生播放器。刷新页面可恢复。${!findPlayerContainer() ? '<br><strong style="color:var(--accent);">⚠ 当前页面不支持页面注入模式。</strong>' : ''}</div>
						</div>

						<div class="vp-tip">💡 支持腾讯视频、爱奇艺、优酷、B站、芒果TV等主流平台。解析源为第三方公共服务，稳定性不保证，如有失效请切换其他源或自行添加。<br>📝 如需记录观影进度，推荐使用「页面注入」模式（原页面信息完整，可用快速记录 Shift+R）；其他模式下可在「观看记录」中手动添加。</div>
					</div>
				`;
			},
			setupEvents(panel, App) {
				const urlInput = panel.querySelector('#vp-url');
				const parseBtn = panel.querySelector('#vp-parse');
				const sourcesGrid = panel.querySelector('#vp-sources');
				const manageBtn = panel.querySelector('#vp-manage-sources');
				const modeRadios = panel.querySelectorAll('input[name="vp-mode"]');

				// 选择解析源
				if (sourcesGrid) {
					sourcesGrid.addEventListener('click', (e) => {
						const btn = e.target.closest('.vp-source-btn');
						if (!btn) return;
						const idx = parseInt(btn.dataset.idx);
						state.settings.videoDefaultParser = idx;
						saveSettings();
						sourcesGrid.querySelectorAll('.vp-source-btn').forEach(b => b.classList.toggle('active', parseInt(b.dataset.idx) === idx));
					});
				}

				// 播放方式切换
				const injectHint = panel.querySelector('#vp-inject-hint');
				modeRadios.forEach(r => {
					r.onchange = () => {
						state.settings.videoPlayMode = r.value;
						saveSettings();
						if (injectHint) injectHint.style.display = r.value === 'inject' ? 'block' : 'none';
					};
				});

				// 解析播放
				if (parseBtn) {
					parseBtn.onclick = () => {
						const videoUrl = (urlInput?.value || '').trim();
						if (!videoUrl) { toast('请输入视频页面 URL'); return; }
						try { new URL(videoUrl); } catch { toast('请输入有效的 URL'); return; }
						const parsers = state.settings.videoParsers || DEFAULT_VIDEO_PARSERS;
						const activeIdx = state.settings.videoDefaultParser || 0;
						const parser = parsers[activeIdx];
						if (!parser || parser.enabled === false) { toast('请先选择一个解析源'); return; }
						const mode = state.settings.videoPlayMode || 'newtab';
						playVideo(parser.url, videoUrl, mode, App);
					};
				}

				// 回车触发解析
				if (urlInput) {
					urlInput.onkeydown = (e) => {
						if (e.key === 'Enter' && parseBtn) parseBtn.click();
					};
				}

				// 管理解析源
				if (manageBtn) {
					manageBtn.onclick = () => App.openVideoParserManager(panel);
				}

				// 检测源
				const testBtn = panel.querySelector('#vp-test-sources');
				if (testBtn && sourcesGrid) {
					testBtn.onclick = () => {
						const parsers = state.settings.videoParsers || DEFAULT_VIDEO_PARSERS;
						const enabled = parsers.filter(p => p.enabled !== false);
						if (!enabled.length) { toast('没有可用的解析源'); return; }
						testBtn.disabled = true;
						testBtn.innerHTML = '检测中…';
						// 重置所有按钮状态
						sourcesGrid.querySelectorAll('.vp-source-btn').forEach(btn => {
							btn.querySelector('.vp-dot')?.remove();
							const dot = document.createElement('span');
							dot.className = 'vp-dot';
							btn.prepend(dot);
						});

						const testUrl = 'https://www.bilibili.com/video/BV1GJ411x7h7';
						let done = 0;
						enabled.forEach(parser => {
							const realIdx = parsers.indexOf(parser);
							const btn = sourcesGrid.querySelector(`.vp-source-btn[data-idx="${realIdx}"]`);
							const dot = btn?.querySelector('.vp-dot');
							const start = Date.now();
							GM.xmlHttpRequest({
								method: 'HEAD',
								url: parser.url + encodeURIComponent(testUrl),
								timeout: 8000,
								onload: (res) => {
									const ms = Date.now() - start;
									if (dot) {
										dot.className = 'vp-dot ' + (ms < 3000 ? 'vp-dot-fast' : 'vp-dot-slow');
										btn.title = `${ms}ms (HTTP ${res.status})`;
									}
									if (++done === enabled.length) finishTest();
								},
								onerror: () => {
									if (dot) { dot.className = 'vp-dot vp-dot-fail'; btn.title = '不可达'; }
									if (++done === enabled.length) finishTest();
								},
								ontimeout: () => {
									if (dot) { dot.className = 'vp-dot vp-dot-fail'; btn.title = '超时(>8s)'; }
									if (++done === enabled.length) finishTest();
								},
							});
						});

						function finishTest() {
							testBtn.disabled = false;
							testBtn.innerHTML = `${I.zap} 检测源`;
							const fast = sourcesGrid.querySelectorAll('.vp-dot-fast').length;
							const slow = sourcesGrid.querySelectorAll('.vp-dot-slow').length;
							const fail = sourcesGrid.querySelectorAll('.vp-dot-fail').length;
							toast(`检测完成：${fast} 快 / ${slow} 慢 / ${fail} 不可用`);
						}
					};
				}
			},
			onActivate(panel, { bottomBtn, footInfo }) {
				bottomBtn.innerHTML = `${I.play} 解析播放`;
				bottomBtn.onclick = () => {
					const parseBtn = panel.querySelector('#vp-parse');
					if (parseBtn) parseBtn.click();
				};
				footInfo.textContent = '粘贴视频URL，选择解析源即可播放';
			},
		},
		imggrab: {
			label: TAB_LABELS.imggrab,
			_images: [],
			buildContent() {
				const s = state.settings;
				const mw = s.imgGrabMinWidth || 0;
				const mh = s.imgGrabMinHeight || 0;
				const fmt = s.imgGrabFormat || 'original';
				const sort = s.imgGrabSort || 'default';
				const preview = s.imgGrabPreviewSize || 'medium';
				const rename = s.imgGrabRename || '{PAGETITLE}_{NO}.{EXT}';
				const wOpts = [[0,'全部'],[100,'≥100'],[200,'≥200'],[400,'≥400'],[800,'≥800'],[1200,'≥1200']];
				const hOpts = wOpts;
				return `
					<div class="ig-layout">
						<div class="ig-sidebar">
							<div class="ig-side-label" style="font-size:calc(var(--font-size)*0.857);color:var(--text);font-weight:600;letter-spacing:1;padding:0px 0px 7px;border-bottom:1px solid var(--border);margin:0;">过滤器</div>
							<div class="ig-side-group">
								<span class="ig-side-label">最小宽度</span>
								<select id="ig-min-w">${wOpts.map(([v,l])=>`<option value="${v}" ${mw===v?'selected':''}>${l}</option>`).join('')}</select>
							</div>
							<div class="ig-side-group">
								<span class="ig-side-label">最小高度</span>
								<select id="ig-min-h">${hOpts.map(([v,l])=>`<option value="${v}" ${mh===v?'selected':''}>${l}</option>`).join('')}</select>
							</div>
							<div class="ig-side-group">
								<span class="ig-side-label">图片格式</span>
								<select id="ig-format-filter">
									<option value="all">全部</option><option value="JPEG" ${fmt==='JPEG'?'selected':''}>JPEG</option><option value="PNG" ${fmt==='PNG'?'selected':''}>PNG</option><option value="WebP" ${fmt==='WebP'?'selected':''}>WebP</option><option value="GIF" ${fmt==='GIF'?'selected':''}>GIF</option>
								</select>
							</div>
							<div class="ig-side-group">
								<span class="ig-side-label">排序方式</span>
								<select id="ig-sort">
									<option value="default" ${sort==='default'?'selected':''}>默认</option><option value="areaDesc" ${sort==='areaDesc'?'selected':''}>大图优先</option><option value="areaAsc" ${sort==='areaAsc'?'selected':''}>小图优先</option><option value="widthDesc" ${sort==='widthDesc'?'selected':''}>宽度↓</option><option value="heightDesc" ${sort==='heightDesc'?'selected':''}>高度↓</option>
								</select>
							</div>
							<div class="ig-side-group">
								<span class="ig-side-label">预览大小</span>
								<select id="ig-preview-size">
									<option value="small" ${preview==='small'?'selected':''}>小</option><option value="medium" ${preview==='medium'?'selected':''}>中</option><option value="large" ${preview==='large'?'selected':''}>大</option>
								</select>
							</div>
						</div>
						<div class="notes-resizer ig-resizer" id="ig-resizer"></div>
						<div class="ig-main">
							<div class="ig-top">
								<button class="btn btn-primary" id="ig-refresh">${I.search} 嗅探图片</button>
								<div style="width:1px;height:18px;background:var(--border);flex-shrink:0;"></div>
								<button class="btn btn-ghost" id="ig-sel-all">全选</button>
								<button class="btn btn-ghost" id="ig-sel-none">取消全选</button>
								<select id="ig-dl-format" class="filter-select" title="下载格式">
									<option value="original">原格式</option><option value="JPEG">转JPEG</option><option value="PNG">转PNG</option><option value="WebP">转WebP</option>
								</select>
								<button class="btn btn-ghost" id="ig-export-links">导出链接</button>
								<select id="ig-rename" class="filter-select" title="重命名" style="max-width:100px;">
									<option value="{PAGETITLE}_{NO}.{EXT}" ${rename==='{PAGETITLE}_{NO}.{EXT}'?'selected':''}>标题_序号</option>
									<option value="{NAME}.{EXT}" ${rename==='{NAME}.{EXT}'?'selected':''}>原文件名</option>
									<option value="{DATE}_{NO}.{EXT}" ${rename==='{DATE}_{NO}.{EXT}'?'selected':''}>日期_序号</option>
									<option value="custom">自定义</option>
								</select>
								<button class="btn btn-ghost accent-btn" id="ig-download">下载</button>
								<input type="text" id="ig-rename-custom" value="${escapeHTML(rename)}" style="display:none;flex:1;min-width:80px;font-size:calc(var(--font-size)*0.714);padding:6px 6px;" placeholder="{NO}_{PAGETITLE}.{EXT}">
								<span class="ig-count" id="ig-count">0 / 0</span>
							</div>
							<div class="ig-progress" id="ig-progress" style="display:none;"><div class="ig-progress-bar" id="ig-progress-bar"></div></div>
							<div class="ig-grid size-${preview}" id="ig-grid"><div class="empty-state" style="grid-column:1/-1;"><div class="empty-icon">${I.image}</div><div class="empty-title">点击「嗅探」扫描当前页面图片</div><div class="empty-sub">支持小红书内容图片提取</div></div></div>
						</div>
					</div>
				`;
			},
			setupEvents(panel, App) {
				const self = this;
				const grid = panel.querySelector('#ig-grid');
				const countEl = panel.querySelector('#ig-count');
				const progressWrap = panel.querySelector('#ig-progress');
				const progressBar = panel.querySelector('#ig-progress-bar');

				const getTemplate = () => {
					const sel = panel.querySelector('#ig-rename');
					if (sel.value === 'custom') return panel.querySelector('#ig-rename-custom')?.value || '{NO}.{EXT}';
					return sel.value;
				};
				const getDlFormat = () => panel.querySelector('#ig-dl-format')?.value || 'original';

				const getFiltered = () => {
					let imgs = [...self._images];
					const minW = parseInt(panel.querySelector('#ig-min-w')?.value || '0');
					const minH = parseInt(panel.querySelector('#ig-min-h')?.value || '0');
					const fmtF = panel.querySelector('#ig-format-filter')?.value || 'all';
					const sortV = panel.querySelector('#ig-sort')?.value || 'default';
					if (minW > 0) imgs = imgs.filter(i => (i.w || 0) >= minW);
					if (minH > 0) imgs = imgs.filter(i => (i.h || 0) >= minH);
					if (fmtF !== 'all') imgs = imgs.filter(i => i.format === fmtF);
					if (sortV === 'areaDesc') imgs.sort((a, b) => ((b.w||0)*(b.h||0)) - ((a.w||0)*(a.h||0)));
					else if (sortV === 'areaAsc') imgs.sort((a, b) => ((a.w||0)*(a.h||0)) - ((b.w||0)*(b.h||0)));
					else if (sortV === 'widthDesc') imgs.sort((a, b) => (b.w||0) - (a.w||0));
					else if (sortV === 'heightDesc') imgs.sort((a, b) => (b.h||0) - (a.h||0));
					return imgs;
				};

				const renderGrid = () => {
					const filtered = getFiltered();
					if (!filtered.length) {
						grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;"><div class="empty-icon">${I.image}</div><div class="empty-title">${self._images.length ? '无匹配图片' : '未嗅探到图片'}</div><div class="empty-sub">${self._images.length ? '调整筛选条件' : '点击嗅探开始'}</div></div>`;
						updateCount(); return;
					}
					grid.innerHTML = filtered.map(img => {
						const i = img._idx;
						const dim = (img.w && img.h) ? `${img.w}×${img.h}` : '…';
						return `<div class="ig-card${img.selected ? ' selected' : ''}" data-idx="${i}">
							<input type="checkbox" class="ig-check" data-idx="${i}" ${img.selected ? 'checked' : ''}>
							<img src="${escapeHTML(img.url)}" referrerpolicy="no-referrer" loading="lazy" onerror="this.parentElement.style.display='none'">
							<div class="ig-dim">${dim} ${img.format||''}</div>
							<div class="ig-actions"><button data-act="open" title="新窗口">↗</button><button data-act="dl" title="下载">↓</button></div>
						</div>`;
					}).join('');
					updateCount();
				};

				const updateCount = () => {
					countEl.textContent = `${self._images.filter(i=>i.selected).length} / ${self._images.length}`;
				};

				const setSelection = (fn) => {
					self._images.forEach(img => { img.selected = fn(img); });
					grid.querySelectorAll('.ig-card').forEach(card => {
						const idx = parseInt(card.dataset.idx);
						card.classList.toggle('selected', self._images[idx]?.selected);
						const cb = card.querySelector('.ig-check'); if (cb) cb.checked = self._images[idx]?.selected;
					});
					updateCount();
				};

				const doSniff = async () => {
					self._images = sniffImages(0);
					self._images.forEach((img, i) => { img._idx = i; img.selected = true; img.w = 0; img.h = 0; img.format = detectImgFormat(img.url); });
					renderGrid();
					toast(`嗅探到 ${self._images.length} 张，加载尺寸…`);
					const queue = [...self._images];
					await Promise.all(Array.from({ length: 5 }, async () => {
						while (queue.length) {
							const img = queue.shift(); if (!img) break;
							const meta = await loadImageMeta(img.url);
							img.w = meta.w; img.h = meta.h;
							// HEAD 请求修正格式（CDN URL 无扩展名时 detectImgFormat 可能返回错误默认值）
							try {
								const resp = await fetch(img.url, { method: 'HEAD', referrerPolicy: 'no-referrer' });
								const ct = resp.headers.get('content-type') || '';
								if (ct.includes('webp')) img.format = 'WebP';
								else if (ct.includes('png')) img.format = 'PNG';
								else if (ct.includes('gif')) img.format = 'GIF';
								else if (ct.includes('jpeg') || ct.includes('jpg')) img.format = 'JPEG';
							} catch {}
							const card = grid.querySelector(`.ig-card[data-idx="${img._idx}"] .ig-dim`);
							if (card) card.textContent = (meta.w && meta.h) ? `${meta.w}×${meta.h} ${img.format}` : `… ${img.format}`;
						}
					}));
					toast('尺寸加载完成');
				};

				panel.querySelector('#ig-refresh')?.addEventListener('click', doSniff);
				panel.querySelector('#ig-sel-all')?.addEventListener('click', () => setSelection(() => true));
				panel.querySelector('#ig-sel-none')?.addEventListener('click', () => setSelection(() => false));
				['ig-min-w','ig-min-h','ig-format-filter','ig-sort'].forEach(id => {
					panel.querySelector(`#${id}`)?.addEventListener('change', renderGrid);
				});
				panel.querySelector('#ig-preview-size')?.addEventListener('change', (e) => { grid.className = `ig-grid size-${e.target.value}`; });
				panel.querySelector('#ig-rename')?.addEventListener('change', (e) => {
					const c = panel.querySelector('#ig-rename-custom');
					if (e.target.value === 'custom') { c.style.display = ''; c.focus(); } else { c.style.display = 'none'; }
				});

				// 卡片点击
				grid.addEventListener('click', (e) => {
					const card = e.target.closest('.ig-card'); if (!card) return;
					const idx = parseInt(card.dataset.idx); if (isNaN(idx)) return;
					const act = e.target.closest('[data-act]')?.dataset.act;
					if (act === 'open') { window.open(self._images[idx].url, '_blank'); return; }
					if (act === 'dl') {
						const fmt = getDlFormat();
						let url = xhsFormatUrl(self._images[idx].url, fmt);
						downloadImageBlob(url).then(async blob => {
							blob = await convertImageBlob(blob, fmt);
							const ext = fmt === 'original' ? getExtFromUrl(self._images[idx].url) : fmt.toLowerCase();
							const img = { ...self._images[idx], format: fmt === 'original' ? self._images[idx].format : fmt };
							triggerDownload(applyRename(getTemplate(), idx, self._images.length, img), blob);
						}).catch(() => toast('下载失败'));
						return;
					}
					if (e.target.classList.contains('ig-check') || !e.target.closest('.ig-actions')) {
						self._images[idx].selected = !self._images[idx].selected;
						card.classList.toggle('selected', self._images[idx].selected);
						const cb = card.querySelector('.ig-check'); if (cb) cb.checked = self._images[idx].selected;
						updateCount();
					}
				});

				// 下载
				panel.querySelector('#ig-download')?.addEventListener('click', async () => {
					const selected = self._images.filter(i => i.selected);
					if (!selected.length) { toast('请先选择'); return; }
					const fmt = getDlFormat();
					const btn = panel.querySelector('#ig-download');
					btn.disabled = true; btn.textContent = '下载中…';
					progressWrap.style.display = ''; progressBar.style.width = '0%';
					let ok = 0;
					for (let i = 0; i < selected.length; i++) {
						try {
							let url = xhsFormatUrl(selected[i].url, fmt);
							let blob = await downloadImageBlob(url);
							blob = await convertImageBlob(blob, fmt);
							const ext = fmt === 'original' ? getExtFromUrl(selected[i].url) : fmt.toLowerCase();
							const img = { ...selected[i], format: fmt === 'original' ? selected[i].format : fmt };
							triggerDownload(applyRename(getTemplate(), i, selected.length, img), blob);
							ok++;
						} catch {}
						progressBar.style.width = `${Math.round(((i+1)/selected.length)*100)}%`;
						if (i < selected.length - 1) await new Promise(r => setTimeout(r, 100));
					}
					btn.disabled = false; btn.textContent = '下载';
					progressWrap.style.display = 'none';
					toast(`已下载 ${ok} 张`);
				});

				// 导出链接
				panel.querySelector('#ig-export-links')?.addEventListener('click', () => {
					const selected = self._images.filter(i => i.selected);
					if (!selected.length) { toast('请先选择'); return; }
					navigator.clipboard.writeText(selected.map(i => i.url).join('\n')).then(() => toast(`已复制 ${selected.length} 条链接`)).catch(() => toast('复制失败'));
				});

				// 侧栏拖拽调节宽度
				const resizer = panel.querySelector('#ig-resizer');
				const sidebar = panel.querySelector('.ig-sidebar');
				if (resizer && sidebar) {
					let dragging = false, startX = 0, startW = 0;
					resizer.addEventListener('mousedown', (e) => { dragging = true; startX = e.clientX; startW = sidebar.offsetWidth; resizer.classList.add('active'); document.body.style.userSelect = 'none'; });
					window.addEventListener('mousemove', (e) => { if (!dragging) return; const panelW = panel.querySelector('.ig-layout')?.offsetWidth || 600; const newW = Math.max(120, Math.min(panelW * 0.45, startW + (e.clientX - startX))); sidebar.style.width = newW + 'px'; });
					window.addEventListener('mouseup', () => { if (dragging) { dragging = false; resizer.classList.remove('active'); document.body.style.userSelect = ''; } });
				}
			},
			onActivate(panel, { bottomBtn, footInfo }) {
				bottomBtn.innerHTML = `${I.image} 开始嗅探`;
				bottomBtn.onclick = () => { panel.querySelector('#ig-refresh')?.click(); };
				footInfo.textContent = this._images.length ? `共 ${this._images.length} 张图片` : '点击按钮开始嗅探';
			},
		},
	};

	// ═══════════════════════════════════════════════════════
	//  APP
	// ═══════════════════════════════════════════════════════
	const App = {
		host: null, shadow: null, styleEl: null,
		overlays: {}, ballEl: null, ballMenuOpen: false, _mainPinned: false, _maximized: false,
		tunerBar: null, currentTuner: null,
		_ballTimer: null, dragSrcEl: null, hotkeyListener: null,

		init() {
			if (this.isBlacklisted()) return;

			// 防止 iframe 中重复创建
			if (window.self !== window.top) {
				// iframe 中仍注册快捷键，方便快速记录
				this.registerHotkeys();
				GM_registerMenuCommand('📋 管理面板', () => this.openMain());
				GM_registerMenuCommand('⚡ 快速记录', () => this.openRecord());
				GM_registerMenuCommand('❓ 使用帮助', () => this.openHelp());
				return;
			}

			// 防止重复挂载
			if (document.getElementById('cine-root')) return;

			this.mountShadow();
			this.applyTheme();
			if (state.settings.enableBall) this.mountBall();
			this.bindGlobal();
			this.syncListener();
			this.registerHotkeys();
			GM_registerMenuCommand('📋 管理面板', () => this.openMain());
			GM_registerMenuCommand('⚡ 快速记录', () => this.openRecord());
			GM_registerMenuCommand('❓ 使用帮助', () => this.openHelp());

			// 智能提醒：检查今日更新
			checkScheduleReminders();
			setInterval(checkScheduleReminders, 3600000);

			// 系统主题跟随
			const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
			prefersDark.addEventListener('change', (e) => {
				if (state.settings._userThemeSelected) return;
				const targetTheme = e.matches ? 'glassDark' : 'glassLight';
				if (THEMES[targetTheme]) {
					state.settings.theme = targetTheme;
					saveSettings();
					this.applyTheme();
				}
			});

			// SPA 路由监听
			this.watchRouteChanges();
		},

		isBlacklisted() {
			const h = window.location.hostname;
			const mode = state.settings.listMode || 'black';
			const list = mode === 'black' ? (state.settings.blacklist || []) : (state.settings.whitelist || []);
			const match = list.some(p => { try { return p && new RegExp('^' + p.replace(/\*/g, '.*') + '$').test(h); } catch { return false; } });
			return mode === 'black' ? match : !match;
		},

		openHelp() {
			if (typeof GM_openInTab === 'function') GM_openInTab(HELP_URL, { active: true });
			else window.open(HELP_URL, '_blank');
		},

		mountShadow() {
			this.host = document.createElement('div');
			this.host.id = 'cine-root';
			this.host.style.cssText = 'position:fixed;top:0;left:0;width:0;height:0;z-index:2147483647;';
			document.body.appendChild(this.host);
			this.shadow = this.host.attachShadow({ mode: 'open' });
			this.styleEl = document.createElement('style');
			this.shadow.appendChild(this.styleEl);
			this.ctrlEl = document.createElement('div');
			this.ctrlEl.id = 'cine-ctrl';
			this.shadow.appendChild(this.ctrlEl);
		},

		applyTheme() {
			this.styleEl.textContent = buildCSS(getTheme(), state.settings.font, state.settings.ui);
		},

		// ── FLOATING BALL ──
		mountBall() {
			if (this.ballEl) this.ballEl.remove();
			const ballCfg = state.settings.ball || DEFAULT_BALL;
			const size = ballCfg.size || 42;
			const bgOpacity = ballCfg.bgOpacity !== undefined ? ballCfg.bgOpacity : 1.0;
			const pos = state.settings.ballPos;

			const host = document.createElement('div');
			host.className = 'ball-host';
			applyBallHostPos(host, pos);

			const menuEl = document.createElement('div'); menuEl.className = 'ball-menu';
			menuEl.innerHTML = `
                <div class="ball-mini-wrap">
                    <div class="ball-mini" data-action="hideball" style="color:#f87171;border-color:rgba(239,68,68,0.2);">${I.x}</div>
                    <span class="ball-mini-label">关闭悬浮球</span>
                </div>
                <div class="ball-mini-wrap">
                    <div class="ball-mini" data-action="settings">${I.gear}</div>
                    <span class="ball-mini-label">助手设置</span>
                </div>
                <div class="ball-mini-wrap">
                    <div class="ball-mini" data-action="record">${I.zap}</div>
                    <span class="ball-mini-label">快速记录</span>
                </div>
                <div class="ball-mini-wrap">
                    <div class="ball-mini accent-text" data-action="help">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    </div>
                    <span class="ball-mini-label">使用帮助</span>
                </div>
            `;

			const ball = document.createElement('div');
			ball.className = 'ball';
			ball.style.cssText = `width:${size}px;height:${size}px;background:color-mix(in srgb, var(--surface) ${Math.round(bgOpacity * 100)}%, transparent);border:1.5px solid var(--border);`;
			ball.innerHTML = I.compass;
			host.appendChild(menuEl);
			host.appendChild(ball);
			this.shadow.appendChild(host);
			this.ballEl = host;
			this.closeBallMenu(menuEl);

			// 拖拽（松手后吸附到左右两侧）
			let dragging = false, sx, sy, ix, iy;
			const onStart = (e) => {
				if (e.button !== undefined && e.button !== 0) return;
				dragging = false;
				const pt = e.touches ? e.touches[0] : e;
				sx = pt.clientX; sy = pt.clientY;
				const rect = host.getBoundingClientRect();
				ix = rect.left; iy = rect.top;
				const onMove = (ev) => {
					ev.preventDefault();
					const mp = ev.touches ? ev.touches[0] : ev;
					if (!dragging && (Math.abs(mp.clientX - sx) > 6 || Math.abs(mp.clientY - sy) > 6)) dragging = true;
					if (dragging) {
						const nx = Math.max(0, Math.min(window.innerWidth - size, ix + mp.clientX - sx));
						const ny = Math.max(0, Math.min(window.innerHeight - size, iy + mp.clientY - sy));
						host.style.left = nx + 'px'; host.style.top = ny + 'px';
						host.style.right = 'auto'; host.style.bottom = 'auto';
					}
				};
				const onEnd = () => {
					document.removeEventListener('mousemove', onMove);
					document.removeEventListener('mouseup', onEnd);
					document.removeEventListener('touchmove', onMove);
					document.removeEventListener('touchend', onEnd);
					if (dragging) {
						const rect = host.getBoundingClientRect();
						host.style.top = Math.max(0, Math.min(window.innerHeight - size, rect.top)) + 'px';
						if (rect.left + size / 2 >= window.innerWidth / 2) {
							host.style.right = '12px'; host.style.left = 'auto';
						} else {
							host.style.left = '12px'; host.style.right = 'auto';
						}
						state.settings.ballPos = { top: host.style.top || 'auto', right: host.style.right || 'auto', left: host.style.left || 'auto', bottom: 'auto' };
						saveSettings();
					}
				};
				document.addEventListener('mousemove', onMove);
				document.addEventListener('mouseup', onEnd);
				document.addEventListener('touchmove', onMove, { passive: false });
				document.addEventListener('touchend', onEnd);
			};
			ball.addEventListener('mousedown', onStart);
			ball.addEventListener('touchstart', onStart, { passive: false });

			const clickMode = state.settings.clickMode || 'single-main';
			ball.addEventListener('click', (e) => {
				if (e.pointerType === 'touch') { _justLongPressed = false; return; }
				if (dragging) return;
				if (this.ballMenuOpen) { this.closeBallMenu(menuEl); return; }
				clearTimeout(this._ballTimer);
				this._ballTimer = setTimeout(() => {
					if (!this.ballMenuOpen) {
						clickMode === 'single-main' ? this.openMain(false) : this.openRecord();
					}
				}, 220);
			});
			ball.addEventListener('dblclick', () => {
				clearTimeout(this._ballTimer);
				clickMode === 'single-main' ? this.openRecord() : this.openMain(false);
			});
			ball.addEventListener('contextmenu', e => {
				e.preventDefault();
				this.ballMenuOpen ? this.closeBallMenu(menuEl) : this.openBallMenu(menuEl);
			});

			// iPad 触控：单击 / 双击 / 长按
			let _tapCount = 0, _tapTimer = null, _longPressTimer = null, _justLongPressed = false;
			ball.addEventListener('touchstart', () => {
				clearTimeout(_longPressTimer);
				_longPressTimer = setTimeout(() => {
					_justLongPressed = true;
					_tapCount = 0; clearTimeout(_tapTimer); _tapTimer = null;
					this.ballMenuOpen ? this.closeBallMenu(menuEl) : this.openBallMenu(menuEl);
				}, 500);
			}, { passive: true });
			ball.addEventListener('touchend', () => {
				clearTimeout(_longPressTimer);
				if (_justLongPressed) { _justLongPressed = false; return; }
				if (!_tapTimer) { _tapCount = 0; }
				_tapCount++;
				clearTimeout(_tapTimer);
				_tapTimer = setTimeout(() => {
					const cnt = _tapCount; _tapCount = 0; _tapTimer = null;
					if (this.ballMenuOpen) { this.closeBallMenu(menuEl); return; }
					if (cnt === 1) { clickMode === 'single-main' ? this.openMain(false) : this.openRecord(); }
					else if (cnt >= 2) { clickMode === 'single-main' ? this.openRecord() : this.openMain(false); }
				}, 300);
			});

			menuEl.querySelectorAll('.ball-mini').forEach(btn => btn.addEventListener('click', e => {
				const a = e.currentTarget.dataset.action;
				this.closeBallMenu(menuEl);
				if (a === 'record') this.openRecord();
				if (a === 'settings') this.openSettings();
				if (a === 'help') this.openHelp();
				if (a === 'hideball') {
					if (this.ballEl) { this.ballEl.remove(); this.ballEl = null; }
					toast('悬浮球已临时隐藏，刷新后恢复。可在设置中永久关闭');
				}
			}));
		},

		openBallMenu(m) {
			const host = this.ballEl; if (!host) return;
			const rect = host.getBoundingClientRect();
			const isLeft = rect.left + rect.width / 2 < window.innerWidth / 2;
			const isTop = rect.top + rect.height / 2 < window.innerHeight / 2;
			if (isLeft) { m.style.left = '0'; m.style.right = 'auto'; m.style.alignItems = 'flex-start'; }
			else { m.style.left = 'auto'; m.style.right = '0'; m.style.alignItems = 'flex-end'; }
			if (isTop) { m.style.top = '100%'; m.style.bottom = 'auto'; m.style.flexDirection = 'column'; }
			else { m.style.top = 'auto'; m.style.bottom = 'calc(100% + 6px)'; m.style.flexDirection = 'column-reverse'; }
			m.querySelectorAll('.ball-mini-label').forEach(label => {
				if (isLeft) { label.style.left = '40px'; label.style.right = 'auto'; }
				else { label.style.left = 'auto'; label.style.right = '40px'; }
			});
			this.ballMenuOpen = true; m.classList.add('open');
		},

		closeBallMenu(m) { this.ballMenuOpen = false; m.classList.remove('open'); },

		// ── OVERLAY FACTORY ──
		makeOverlay(id, content, opts = {}) {
			this.shadow.querySelectorAll(`.overlay[data-id="${id}"]`).forEach(el => el.remove());
			delete this.overlays[id];
			const ov = document.createElement('div'); ov.className = 'overlay'; ov.dataset.id = id;
			ov.setAttribute('role', 'dialog');
			ov.setAttribute('aria-modal', 'true');
			ov.setAttribute('aria-label', opts.ariaLabel || '面板');
			const panel = document.createElement('div'); panel.className = 'panel' + (opts.panelClass || '');
			panel.innerHTML = content; ov.appendChild(panel); this.shadow.appendChild(ov); this.overlays[id] = ov;
			if (this.ctrlEl) this.ctrlEl.classList.add('overlay-active');

			requestAnimationFrame(() => requestAnimationFrame(() => ov.classList.add('open')));
			ov.addEventListener('mousedown', e => {
				if (e.target === ov) {
					if (id === 'main' && this._mainPinned) return;
					if (opts.persistent) return;
					this.closeOverlay(id);
				}
			});

			// 焦点陷阱：限制 Tab 在面板内循环
			const focusable = panel.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
			const initialEl = opts.initialFocus === false ? null : (opts.initialFocus ? panel.querySelector(opts.initialFocus) : null);
			if (initialEl) initialEl.focus();
			else if (opts.initialFocus !== false && focusable.length) focusable[0].focus();
			panel.addEventListener('keydown', (e) => {
				if (e.key !== 'Tab') return;
				const first = focusable[0];
				const last = focusable[focusable.length - 1];
				if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
				else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
			});

			// 阻止面板内无滚动或边界处的滚轮穿透（支持嵌套滚动容器）
			const findScrollContainers = (root) => {
				const containers = [];
				const walk = (el) => {
					if (el.scrollHeight > el.clientHeight && (el.style.overflowY === 'auto' || el.style.overflowY === 'scroll' || el.classList.contains('panel-body') || el.classList.contains('settings-content'))) {
						containers.push(el);
					}
					Array.from(el.children).forEach(walk);
				};
				walk(root);
				return containers.length ? containers : [root];
			};

			const scrollContainers = findScrollContainers(panel);

			// 绑定滚轮事件（防止穿透，但允许内部滚动）
			panel.addEventListener('wheel', (e) => {
				// 找到实际产生滚动的祖先容器（可能嵌套）
				let target = e.target;
				let scrollContainer = null;
				while (target && target !== panel) {
					const style = window.getComputedStyle(target);
					const overflowY = style.overflowY;
					if ((overflowY === 'auto' || overflowY === 'scroll') && target.scrollHeight > target.clientHeight) {
						scrollContainer = target;
						break;
					}
					target = target.parentElement;
				}
				// 如果没有任何可滚动容器，说明整个面板（或当前区域）不可滚动，必须阻止穿透
				if (!scrollContainer) {
					e.preventDefault();
					return;
				}

				const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
				const atTop = scrollTop <= 0;
				const atBottom = scrollTop + clientHeight >= scrollHeight - 1;

				// 如果向上滚动且已在顶部，阻止事件穿透到背景
				if (e.deltaY < 0 && atTop) {
					e.preventDefault();
					return;
				}
				// 如果向下滚动且已在底部，阻止事件穿透到背景
				if (e.deltaY > 0 && atBottom) {
					e.preventDefault();
					return;
				}
			}, { passive: false });

			return { ov, panel };
		},
		closeOverlay(id) {
			const ov = this.overlays[id]; if (!ov) return;
			delete this.overlays[id];
			ov.classList.remove('open');
			setTimeout(() => ov.remove(), 280);
			if (this.ctrlEl && !this.shadow.querySelector('.overlay.open')) {
				this.ctrlEl.classList.remove('overlay-active');
			}
		},
		closeAll() { Object.keys(this.overlays).forEach(id => this.closeOverlay(id)); },

		// ── TUNER BAR ──
		showTunerBar(type) {
			if (this.tunerBar) this.tunerBar.remove();
			const ui = state.settings.ui;
			const widthKey = type === 'main' ? 'mainWidth' : type === 'edit' ? 'editWidth' : 'settingsWidth';
			const saved = { width: ui[widthKey], opacity: ui.opacity, blur: ui.blur };

			const bar = document.createElement('div'); bar.className = 'tuner-bar';
			bar.innerHTML = `
                <div class="slider-group">
                    <span class="slider-label">面板宽度</span>
                    <input type="range" id="tb-width" min="380" max="1200" step="5" value="${ui[widthKey]}">
                    <span class="slider-val" id="tbw-val">${ui[widthKey]}px</span>
                    <button class="btn-icon pad-xs" data-reset-slider="tb-width" data-reset-val="${DEFAULT_UI[widthKey]}" title="恢复默认">${I.undo}</button>
                </div>
                <div class="slider-group">
                    <span class="slider-label">不透明度</span>
                    <input type="range" id="tb-opacity" min="0.3" max="1" step="0.01" value="${ui.opacity}">
                    <span class="slider-val" id="tbo-val">${Math.round(ui.opacity * 100)}%</span>
                    <button class="btn-icon pad-xs" data-reset-slider="tb-opacity" data-reset-val="${DEFAULT_UI.opacity}" title="恢复默认" >${I.undo}</button>
                </div>
                <div class="slider-group">
                    <span class="slider-label">遮罩模糊</span>
                    <input type="range" id="tb-blur" min="0" max="24" step="1" value="${ui.blur}">
                    <span class="slider-val" id="tbb-val">${ui.blur}px</span>
                    <button class="btn-icon pad-xs" data-reset-slider="tb-blur" data-reset-val="${DEFAULT_UI.blur}" title="恢复默认" >${I.undo}</button>
                </div>
                <button class="btn-icon" id="tb-reset" title="全部恢复默认">${I.undo}</button>
                <button class="btn-icon" id="tb-close" title="取消" style="color:#f87171;">${I.x}</button>
                <button class="btn-icon accent-text" id="tb-done"  title="完成" >${I.check}</button>
            `;
			this.shadow.appendChild(bar); this.tunerBar = bar;
			this.currentTuner = { type, widthKey, saved };
			requestAnimationFrame(() => requestAnimationFrame(() => bar.classList.add('open')));

			const update = () => {
				ui[widthKey] = parseInt(bar.querySelector('#tb-width').value);
				ui.opacity = parseFloat(bar.querySelector('#tb-opacity').value);
				ui.blur = parseInt(bar.querySelector('#tb-blur').value);
				this.applyTheme();
				bar.querySelector('#tbw-val').textContent = ui[widthKey] + 'px';
				bar.querySelector('#tbo-val').textContent = Math.round(ui.opacity * 100) + '%';
				bar.querySelector('#tbb-val').textContent = ui.blur + 'px';
			};
			bar.querySelector('#tb-width').oninput = update;
			bar.querySelector('#tb-opacity').oninput = update;
			bar.querySelector('#tb-blur').oninput = update;
			// 个别滑条重置
			bar.querySelectorAll('[data-reset-slider]').forEach(btn => {
				btn.addEventListener('click', () => {
					const targetId = btn.dataset.resetSlider;
					const defaultVal = parseFloat(btn.dataset.resetVal);
					const input = bar.querySelector(`#${targetId}`);
					if (input && !isNaN(defaultVal)) { input.value = defaultVal; update(); }
				});
			});
			bar.querySelector('#tb-reset').onclick = () => {
				ui[widthKey] = DEFAULT_UI[widthKey]; ui.opacity = DEFAULT_UI.opacity; ui.blur = DEFAULT_UI.blur;
				bar.querySelector('#tb-width').value = DEFAULT_UI[widthKey];
				bar.querySelector('#tb-opacity').value = DEFAULT_UI.opacity;
				bar.querySelector('#tb-blur').value = DEFAULT_UI.blur;
				update();
			};
			bar.querySelector('#tb-done').onclick = () => { saveSettings(); this.closeTunerBar(); };
			bar.querySelector('#tb-close').onclick = () => {
				ui[widthKey] = saved.width; ui.opacity = saved.opacity; ui.blur = saved.blur;
				this.applyTheme(); this.closeTunerBar();
			};
		},
		closeTunerBar() {
			if (!this.tunerBar) return;
			this.tunerBar.classList.remove('open');
			setTimeout(() => { if (this.tunerBar) { this.tunerBar.remove(); this.tunerBar = null; this.currentTuner = null; } }, 300);
		},

		// ══════════════════════════════════════════════════
		//  MAIN PANEL
		// ══════════════════════════════════════════════════
		openMain(autoFocus = true, initialTab) {
			if (!initialTab) initialTab = state.settings.defaultTab || 'records';
			const tabOrder = [...new Set(state.settings.tabOrder.filter(id => state.settings.enabledTabs.includes(id)))];
			if (!tabOrder.includes(initialTab)) initialTab = tabOrder[0] || 'records';
			const tabButtonsHtml = tabOrder.map((id, i) =>
				`<button class="tab-btn${i === 0 ? ' active' : ''}" data-tab="${id}">${TAB_REGISTRY[id]?.label || id}</button>`
			).join('');
			const tabContentsHtml = tabOrder.map((id, i) => {
				const content = TAB_REGISTRY[id]?.buildContent() || '';
				const extraClass = id === 'notes' ? ' notes-tab-content' : '';
				return `<div class="tab-content${extraClass}${i === 0 ? ' active' : ''}" data-tab="${id}">${content}</div>`;
			}).join('');
			const focusMap = { platforms: '#p-search', navlinks: '#n-search', notes: '#nt-search' };
			const { ov, panel } = this.makeOverlay('main', `
				<div class="panel-head">
					<div class="head-logo">${I.compass}</div>
					<h2>万象 · <span style="color:var(--accent)">Omni Trail</span></h2>
					<button class="btn-icon" id="m-darkmode" title="切换深浅色">${isDark() ? I.sun : I.moon}</button>
					<button class="btn-icon" id="m-pin" title="置顶面板">${I.pin}</button>
					<button class="btn-icon cloud-btn accent-text" id="m-cloudsync-upload" title="备份当前数据到云端 (WebDAV)" >${I.cloudUpload}</button>
					<button class="btn-icon cloud-btn accent-text" id="m-cloudsync-download" title="从云端恢复数据 (WebDAV)" >${I.cloudDownload}</button>
					<button class="btn-icon" id="m-settings" title="助手设置">${I.gear}</button>
					<button class="btn-icon" id="m-maximize" title="最大化"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg></button>
					<button class="btn-icon" id="m-close" title="关闭">${I.x}</button>
				</div>
				<div class="panel-body">
					<div class="tabs">
						${tabButtonsHtml}
					</div>
					${tabContentsHtml}
				</div>
				<div class="panel-foot">
					<button class="btn btn-primary" id="m-bottom-action">${I.plus} 添加条目</button>
					<button class="btn btn-icon" id="m-quick-record" title="快速记录当前页面">${I.zap}</button>
					<button class="btn btn-icon" id="m-export" title="导出本地备份">${I.upload}</button>
					<button class="btn btn-icon" id="m-import" title="导入本地备份">${I.download}</button>
					<span style="font-size:calc(var(--font-size) * 0.72);color:var(--muted);margin-left:12px;" id="m-last-update"></span>
					<span style="font-size:calc(var(--font-size) * 0.786);color:var(--muted);margin-left:auto;" id="m-foot-info"></span>
				</div>
			`, { panelClass: ' main-panel', initialFocus: autoFocus ? (focusMap[initialTab] || null) : false });

			let currentTab = 'records';
			const tabs = panel.querySelectorAll('.tab-btn');
			const contents = panel.querySelectorAll('.tab-content');
			const bottomBtn = panel.querySelector('#m-bottom-action');
			const footInfo = panel.querySelector('#m-foot-info');
			const tabCtx = { bottomBtn, footInfo, App: this };

			const switchTab = (target) => {
				currentTab = target;
				tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === target));
				contents.forEach(c => c.classList.toggle('active', c.dataset.tab === target));
				bottomBtn.style.display = '';
				bottomBtn.disabled = false;
				TAB_REGISTRY[target]?.onActivate?.(panel, tabCtx);
			};
			tabs.forEach(tab => tab.addEventListener('click', () => switchTab(tab.dataset.tab)));
			// 每个 tab 模块绑定事件
			tabOrder.forEach(id => TAB_REGISTRY[id]?.setupEvents?.(panel, this));
			if (initialTab) switchTab(initialTab);
			else bottomBtn.onclick = () => this.openAddShow();

			// 深浅色快速切换
			panel.querySelector('#m-darkmode')?.addEventListener('click', () => {
				const th = THEMES[state.settings.theme];
				state.settings.theme = (th && th.pair && THEMES[th.pair]) ? th.pair
					: (th.dark ? Object.keys(THEMES).find(k => !THEMES[k].dark) : Object.keys(THEMES).find(k => THEMES[k].dark)) || 'chalk';
				saveSettings(); this.applyTheme();
				panel.querySelector('#m-darkmode').innerHTML = isDark() ? I.sun : I.moon;
			});

			// 视图切换：卡片/列表
			panel.querySelector('#m-vgrid')?.addEventListener('click', () => {
				state.settings.view = 'grid'; saveSettings();
				panel.querySelector('#m-vgrid').classList.add('active');
				panel.querySelector('#m-vlist').classList.remove('active');
				const toggleBtn = panel.querySelector('#m-card-toggle');
				toggleBtn.style.opacity = '1'; toggleBtn.style.pointerEvents = '';
				this.renderShows(panel);
			});
			panel.querySelector('#m-vlist')?.addEventListener('click', () => {
				state.settings.view = 'list'; saveSettings();
				panel.querySelector('#m-vlist').classList.add('active');
				panel.querySelector('#m-vgrid').classList.remove('active');
				const toggleBtn = panel.querySelector('#m-card-toggle');
				toggleBtn.style.opacity = '0.4'; toggleBtn.style.pointerEvents = 'none';
				this.renderShows(panel);
			});

			// 卡片风格单按钮循环切换
			const updateCardToggleTitle = () => {
				const btn = panel.querySelector('#m-card-toggle');
				if (!btn) return;
				const isCls = state.settings.cardStyle === 'classic';
				btn.title = isCls ? '经典卡片（点击切换为沉浸）' : '沉浸卡片（点击切换为经典）';
				btn.classList.toggle('active', !isCls);
			};
			panel.querySelector('#m-card-toggle')?.addEventListener('click', () => {
				state.settings.cardStyle = state.settings.cardStyle === 'classic' ? 'immersive' : 'classic';
				saveSettings();
				updateCardToggleTitle();
				this.renderShows(panel);
			});
			updateCardToggleTitle();

			panel.querySelector('#m-close')?.addEventListener('click', () => { this._mainPinned = false; this.closeOverlay('main'); });
			panel.querySelector('#m-pin')?.addEventListener('click', () => {
				this._mainPinned = !this._mainPinned;
				const pinBtn = panel.querySelector('#m-pin');
				pinBtn.classList.toggle('active', this._mainPinned);
				pinBtn.title = this._mainPinned ? '取消置顶' : '置顶面板';
				toast(this._mainPinned ? '面板已置顶，点击外部不再关闭' : '已取消置顶');
			});
			panel.querySelector('#m-maximize')?.addEventListener('click', () => {
				this._maximized = !this._maximized;
				const maxBtn = panel.querySelector('#m-maximize');
				if (this._maximized) {
					panel.style.width = 'calc(100vw - 40px)';
					panel.style.maxWidth = 'none';
					panel.style.height = 'calc(100vh - 40px)';
					panel.style.maxHeight = 'none';
					maxBtn.title = '还原';
					maxBtn.classList.add('active');
				} else {
					panel.style.width = '';
					panel.style.maxWidth = '';
					panel.style.height = '';
					panel.style.maxHeight = '';
					maxBtn.title = '最大化';
					maxBtn.classList.remove('active');
				}
				panel.querySelectorAll('.tab-content').forEach(c => c.classList.toggle('maximized', this._maximized));
			});
			panel.querySelector('#m-settings')?.addEventListener('click', () => this.openSettings());
			panel.querySelector('#m-quick-record')?.addEventListener('click', () => { this.closeOverlay('main'); this.openRecord(); });

			panel.querySelector('#m-cloudsync-upload')?.addEventListener('click', () => this.backupToCloud());
			panel.querySelector('#m-cloudsync-download')?.addEventListener('click', () => this.restoreFromCloud());

			panel.querySelector('#m-export')?.addEventListener('click', () => this.exportData());
			panel.querySelector('#m-import')?.addEventListener('click', () => this.importData());

			this.renderStats(panel);
			this.renderShows(panel);
			this.renderPlatforms(panel);
		},

		updateFootInfo(panel, count) {
			if (!panel) panel = this.overlays.main?.querySelector('.panel');
			if (!panel) return;
			const el = panel.querySelector('#m-foot-info');
			if (el) el.textContent = `${count !== undefined ? count : state.shows.length} 个条目`;
			// 更新最后更新时间（始终更新，不区分标签页）
			const lastEl = panel.querySelector('#m-last-update');
			if (lastEl) lastEl.textContent = formatLastUpdated();
		},

		renderStats(panel) {
			const bar = panel?.querySelector('#stats-bar'); if (!bar) return;
			const s = state.settings.dict.statuses;
			bar.innerHTML = `
                <div class="stat-item">
                    <div class="stat-dot" style="background:transparent;"></div>
                    <span class="stat-num">${state.shows.length}</span>
                    <span class="stat-label">全部</span>
                </div>
                ${s.slice(0, 4).map(st => `
                    <div class="stat-item">
                        <div class="stat-dot" style="background:${st.color}"></div>
                        <span class="stat-num">${state.shows.filter(x => x.status === st.id).length}</span>
                        <span class="stat-label">${st.label}</span>
                    </div>
                `).join('')}
            `;
		},

		renderShows(panel) {
			if (!panel) panel = this.overlays.main?.querySelector('.panel');
			if (!panel) return;
			const search = (panel.querySelector('#m-search')?.value || '').toLowerCase();
			const filter = panel.querySelector('#m-filter')?.value || 'all';
			const typeFilter = panel.querySelector('#m-type-filter')?.value || 'all';
			const scheduleFilter = panel.querySelector('#m-schedule-filter')?.value || 'all';
			const sort = state.settings.sortBy;
			const view = state.settings.view;
			const cardStyle = state.settings.cardStyle;
			const container = panel.querySelector('#m-container'); if (!container) return;

			let list = state.shows.filter(s => {
				if (filter !== 'all' && s.status !== filter) return false;
				if (typeFilter !== 'all' && s.type !== typeFilter) return false;
				if (scheduleFilter !== 'all' && s.schedule !== scheduleFilter) return false;
				if (search && !(s.name.toLowerCase().includes(search) || (s.type && s.type.toLowerCase().includes(search)) || (s.notes && s.notes.toLowerCase().includes(search)))) return false;
				return true;
			});
			list.sort((a, b) => {
				if (sort === 'updatedDesc') return (b.updatedAt || 0) - (a.updatedAt || 0);
				if (sort === 'createdDesc') return (b.createdAt || 0) - (a.createdAt || 0);
				if (sort === 'nameAsc') return a.name.localeCompare(b.name, 'zh');
				if (sort === 'progressDesc') {
					const pa = a.latestEpisode ? a.currentEpisode / a.latestEpisode : 0;
					const pb = b.latestEpisode ? b.currentEpisode / b.latestEpisode : 0;
					return pb - pa;
				}
				if (sort === 'rating') return (b.rating || 0) - (a.rating || 0);
				return 0;
			});

			this.updateFootInfo(panel, list.length);
			container.innerHTML = '';

			if (!list.length) {
				if (state.shows.length === 0) {
					container.innerHTML = `<div class="empty-state" style="padding:30px 20px;">
						<div class="empty-icon" style="opacity:0.5;margin-bottom:4px;">${I.compass}</div>
						<div class="empty-title" style="font-size:calc(var(--font-size)*1.14);">欢迎使用万象 · Omni Trail</div>
						<div style="display:flex;flex-direction:column;gap:6px;margin-top:14px;text-align:left;max-width:480px;">
							<div class="meta-row">
								<span class="dot-accent"></span>
								点击左下方「添加条目」手动添加剧集条目
							</div>
							<div class="meta-row">
								<span class="dot-accent"></span>
								右键悬浮球查看常用菜单，双击悬浮球打开快速记录
							</div>
							<div class="meta-row">
								<span class="dot-accent"></span>
								<kbd class="kbd">Shift+R</kbd> 抓取当前网页，<kbd class="kbd">Shift+E</kbd> 打开【观看记录】
							</div>
							<div class="meta-row">
								<span class="dot-accent"></span>
								支持状态/类型/更新周期筛选、更新时间/进度/评分排序
							</div>
						</div>
					</div>`;
				} else {
					container.innerHTML = `<div class="empty-state">
						<div class="empty-icon">${I.search}</div>
						<div class="empty-title">没有匹配结果</div>
						<div class="empty-sub">${search ? `未找到包含「${escapeHTML(search)}」的剧集` : '调整筛选条件试试'}</div>
						${search ? '<div class="empty-sub" style="margin-top:4px;">尝试其他关键词或清除筛选条件</div>' : ''}
					</div>`;
				}
				this.updateFootInfo(panel, 0);
				return;
			}

			const wrap = document.createElement('div');
			wrap.className = view === 'grid' ? 'shows-grid' : 'shows-list';

			list.forEach((show, idx) => {
				const st = getStatus(show.status);
				const pct = show.latestEpisode ? Math.min(100, Math.round((show.currentEpisode / show.latestEpisode) * 100)) : 0;
				const hasCover = show.coverUrl && /^(https?:|data:)/.test(show.coverUrl);
				const starHtml = renderStarDisplay(show.rating || 0);

				if (view === 'grid') {
					const card = document.createElement('div');
					card.className = `show-card ${cardStyle === 'immersive' ? 'card-immersive' : 'card-classic'}`;
					card.style.animationDelay = `${idx * ANIM_DELAY_CARD_GRID}ms`;

					if (cardStyle === 'classic') {
						card.innerHTML = `
							<div class="card-cover-wrap">
								${hasCover ? `<img src="${show.coverUrl}" loading="lazy" referrerpolicy="no-referrer" onerror="this.style.display='none'">` : `<canvas class="card-cover-canvas"></canvas>`}
								<div class="card-status-pill" style="color:${st.color};">${st.label}</div>
								<div class="card-ep-badge">E${String(show.currentEpisode).padStart(2, '0')}</div>
							</div>
							<div class="card-inner">
								<div class="card-title" data-tip="${escapeHTML(show.name)}">${highlightText(show.name, search)}</div>
								<div class="card-sub">
									${show.type || ''}
									${show.currentEpisode ? (show.latestEpisode ? ` · ${show.currentEpisode}/${show.latestEpisode}集` : ` · 第${show.currentEpisode}集`) : ''}
									${show.schedule && show.schedule !== 'unset' ? ` · ${formatSchedule(show.schedule)}` : ''}
								</div>
								<div class="card-rating">${starHtml}</div>
								<div class="card-progress"><div class="card-progress-bar" style="width:${pct}%;background:${st.color};"></div></div>
								<div class="card-actions">
									<button class="btn-icon" data-act="play"  title="播放">${I.play}</button>
									<button class="btn-icon accent-btn" data-act="inc" title="集数 +1（同时记录当前页面链接）">+1</button>
									<button class="btn-icon" data-act="edit"  title="编辑">${I.edit}</button>
									<button class="btn-icon" data-act="del"   title="删除" style="color:#f87171;border-color:rgba(239,68,68,0.25);">${I.trash}</button>
								</div>
							</div>`;
					} else {
						const starImmersive = starHtml.replace(/var\(--border\)/g, 'rgba(255,255,255,0.5)');
						card.innerHTML = `
							<div class="card-cover-wrap">
								${hasCover ? `<img src="${show.coverUrl}" loading="lazy" referrerpolicy="no-referrer" onerror="this.style.display='none'">` : `<canvas class="card-cover-canvas"></canvas>`}
								<div class="card-status-pill" style="color:${st.color};position:absolute;top:8px;left:8px;">${st.label}</div>
							</div>
							<div class="card-overlay">
								<div class="card-title" data-tip="${escapeHTML(show.name)}">${highlightText(show.name, search)}</div>
								<div class="card-sub">
									${show.type || ''}
									${show.currentEpisode ? (show.latestEpisode ? ` · ${show.currentEpisode}/${show.latestEpisode}集` : ` · 第${show.currentEpisode}集`) : ''}
									${show.schedule && show.schedule !== 'unset' ? ` · ${formatSchedule(show.schedule)}` : ''}
								</div>
								<div class="card-detail">
									<div class="card-rating">${starImmersive}</div>
									<div class="card-actions">
										<button class="btn-icon" data-act="play"  title="播放">${I.play}</button>
										<button class="btn-icon accent-btn" data-act="inc" title="集数 +1（同时记录当前页面链接）">+1</button>
										<button class="btn-icon" data-act="edit"  title="编辑">${I.edit}</button>
										<button class="btn-icon" data-act="del"   title="删除" style="color:#fca5a5;">${I.trash}</button>
									</div>
								</div>
							</div>`;
					}

					if (!hasCover) drawCanvasCover(card.querySelector('canvas'), show.name, 280, 168);
					card.dataset.showId = show.id;
					wrap.appendChild(card);
				} else {
					const row = document.createElement('div'); row.className = 'list-row'; row.style.animationDelay = `${idx * ANIM_DELAY_CARD_LIST}ms`;
					// 进度环 SVG
					const ringHtml = `
						<div class="list-prog" title="已看 ${pct}%">
							<svg class="list-ring" viewBox="0 0 36 36">
								<circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--border)" stroke-width="2" />
								<circle cx="18" cy="18" r="15.5" fill="none" stroke="${st.color}" stroke-width="2"
									stroke-dasharray="${pct} 100" stroke-linecap="round" transform="rotate(-90 18 18)" />
							</svg>
						</div>`;
					row.innerHTML = `
						${hasCover ? `<img class="list-thumb" src="${show.coverUrl}" loading="lazy" referrerpolicy="no-referrer" onerror="this.style.display='none'">` : `<canvas class="list-thumb-cv"></canvas>`}
						<div class="list-name" data-tip="${escapeHTML(show.name)}">${highlightText(show.name, search)}</div>
						<div class="list-meta">
							<span class="status-badge" style="color:${st.color};border-color:${st.color}28;background:${st.color}15;">${st.label}</span>
							<span class="list-ep">
								${show.type || ''}
								${show.currentEpisode}${show.latestEpisode ? '/' + show.latestEpisode : ''} 集
								${show.schedule && show.schedule !== 'unset' ? ` · ${formatSchedule(show.schedule)}` : ''}
							</span>
							<div class="list-rating" style="font-size:calc(var(--font-size) * 0.929);">${starHtml}</div>
							${ringHtml}
						</div>
						<div class="list-actions">
							<button class="btn-icon" data-act="play" title="播放">${I.play}</button>
							<button class="btn-inc"   data-act="inc"  title="集数 +1（同时记录当前页面链接）">+1</button>
							<button class="btn-icon" data-act="edit" title="编辑">${I.edit}</button>
							<button class="btn-icon" data-act="del"  title="删除" style="color:#f87171;border-color:rgba(239,68,68,0.25);">${I.trash}</button>
						</div>`;
					if (!hasCover) drawCanvasCover(row.querySelector('canvas'), show.name, 88, 56);
					row.dataset.showId = show.id;
					wrap.appendChild(row);
				}
			});
			container.appendChild(wrap);
			this.renderStats(panel);
		},

		bindCardActions(el, show, panel) {
			// 整个卡片/列表行点击时跳转到播放链接（排除按钮区域）
			el.addEventListener('click', (e) => {
				if (e.target.closest('button') || e.target.closest('.card-actions') || e.target.closest('.list-actions')) return;
				const best = getBestLink(show);
				if (best) {
					window.open(best.url, '_blank');
				} else {
					toast('暂无播放链接，请先编辑添加');
				}
			});

			el.querySelectorAll('[data-act]').forEach(btn => btn.onclick = e => {
				e.stopPropagation();
				const act = btn.dataset.act;
				if (act === 'play') {
					const best = getBestLink(show);
					if (best) window.open(best.url, '_blank');
					else toast('暂无播放链接，请先编辑添加');
				}
				if (act === 'inc') {
					const oldEp = show.currentEpisode || 0;
					const newEp = oldEp + 1;
					const oldLinks = JSON.parse(JSON.stringify(show.links || []));
					show.currentEpisode = newEp;
					show.updatedAt = Date.now();
					if (!Array.isArray(show.history)) show.history = [];
					show.history.push({ ep: newEp, ts: Date.now() });
					try { mergeShowLinks(show, window.location.href, newEp); } catch { }
					saveData(); this.renderShows(panel);
					const overLimit = show.latestEpisode && newEp >= show.latestEpisode;
					const msg = `《${show.name}》→ 第${newEp}集` + (overLimit ? '（已达总集数）' : '');
					showUndoToast(msg, () => {
						show.currentEpisode = oldEp;
						show.links = oldLinks;
						show.updatedAt = Date.now();
						if (show.history?.length) show.history.pop();
						saveData(); this.renderShows(panel);
						toast(`已撤销：《${show.name}》恢复到第${oldEp}集`);
					});
				}
				if (act === 'edit') this.openEdit(show, false, false, false);
				if (act === 'del') {
					const delIdx = state.shows.findIndex(s => s.id === show.id);
					const delShow = state.shows[delIdx];
					state.shows.splice(delIdx, 1);
					saveData(); this.renderShows(panel);
					showUndoToast(`已删除《${show.name}》`, () => {
						state.shows.splice(delIdx, 0, delShow);
						saveData(); this.renderShows(panel);
						toast(`已撤销：《${show.name}》已恢复`);
					});
				}
			});
		},

		openAddShow() {
			this.openEdit({
				id: uid(), name: '', type: (typeof state.settings.dict.types[0] === 'string' ? state.settings.dict.types[0] : state.settings.dict.types[0].name),
				currentEpisode: 0, latestEpisode: null, status: 'todo',
				rating: 0, coverUrl: '', links: [], notes: '', schedule: 'unset',
				createdAt: Date.now(),
			}, false, false, true);
		},

		openRecord(forceClean = null) {
			const rawData = extractFromPage();
			const useClean = forceClean !== null ? forceClean : state.settings.autoCleanTitle;
			if (useClean) rawData.name = cleanTitle(rawData.name);
			rawData._candidates = rawData.candidates || [];
			rawData.coverUrl = ''; // 不自动填入封面，避免覆盖用户精心挑选的封面

			// 自动匹配已有记录的类型和总集数（避免每次手动修改）
			if (rawData.name) {
				const existingShow = state.shows.find(s => s.name === rawData.name);
				if (existingShow) {
					rawData.type = existingShow.type;
					rawData.latestEpisode = existingShow.latestEpisode;
				}
			}

			this.openEdit(rawData, true, useClean, false);
		},

		// ── 封面选择器弹窗 ──
		openCoverPicker(currentName, onSelect) {
			const candidates = collectCoverCandidates(currentName || '');
			const { ov, panel } = this.makeOverlay('cover-picker', `
                <div class="panel-head">
                    <div class="head-logo">${I.image}</div>
                    <h2>选择封面</h2>
                    <button class="btn-icon" id="cp-close">${I.x}</button>
                </div>
                <div class="panel-body">
                    <p style="font-size:calc(var(--font-size) * 0.786);color:var(--muted);margin-bottom:8px;">点击选择封面，或手动输入图片 URL：</p>
                    <div style="display:flex;gap:6px;margin-bottom:8px;">
                        <input type="text" id="cp-custom-url" placeholder="手动输入图片 URL…" class="flex-1">
                        <button class="btn btn-ghost" id="cp-use-custom">使用</button>
                    </div>
                    ${currentName ? `<button class="btn btn-ghost" id="cp-bangumi-search" style="width:100%;justify-content:center;margin-bottom:10px;">${I.search}<span id="cp-bangumi-btn-text"> 搜索「${escapeHTML(currentName)}」的封面</span></button>` : ''}
                    <div id="cp-bangumi-status" style="display:none;font-size:calc(var(--font-size)*0.786);color:var(--muted);margin-bottom:8px;"></div>
                    <div class="cover-picker-grid" id="cp-grid"></div>
                    <div class="cover-picker-grid" id="cp-bangumi-grid" style="margin-top:8px;"></div>
                </div>
                <div class="panel-foot">
                    <button class="btn btn-ghost" id="cp-cancel">取消</button>
                </div>
            `, { panelClass: ' edit-panel', ariaLabel: '选择封面' });

			const grid = panel.querySelector('#cp-grid');

			const addCoverOption = (container, url, label, isGenerated) => {
				const opt = document.createElement('div');
				opt.className = 'cover-option'; opt.dataset.url = url; opt.title = label;
				if (isGenerated) {
					const canvas = document.createElement('canvas');
					canvas.style.cssText = 'width:100%;height:68px;display:block;';
					drawCanvasCover(canvas, currentName || '', 200, 68);
					opt.appendChild(canvas);
				} else {
					const img = document.createElement('img');
					img.src = url; img.alt = label; img.loading = 'lazy';
					img.onerror = () => { opt.style.display = 'none'; };
					opt.appendChild(img);
				}
				const lbl = document.createElement('div');
				lbl.className = 'cover-option-label'; lbl.textContent = label;
				opt.appendChild(lbl);
				opt.addEventListener('click', () => {
					container.querySelectorAll('.cover-option').forEach(o => o.classList.remove('selected'));
					opt.classList.add('selected');
					onSelect(isGenerated ? generateCoverDataURL(currentName || '') : url);
					this.closeOverlay('cover-picker');
				});
				container.appendChild(opt);
			};

			// 页面候选封面
			candidates.forEach(c => addCoverOption(grid, c.url, c.label, c.isGenerated));

			// Bangumi 搜索封面
			const bangumiBtn = panel.querySelector('#cp-bangumi-search');
			const bangumiBtnText = panel.querySelector('#cp-bangumi-btn-text');
			if (bangumiBtn && bangumiBtnText) {
				bangumiBtn.addEventListener('click', async () => {
					bangumiBtn.disabled = true;
					bangumiBtnText.textContent = ' 搜索中…';
					const statusEl = panel.querySelector('#cp-bangumi-status');
					statusEl.style.display = 'block';
					statusEl.textContent = '正在搜索…';

					const results = await searchBangumi(currentName);
					const bangumiGrid = panel.querySelector('#cp-bangumi-grid');
					bangumiGrid.innerHTML = '';

					if (!results.length) {
						statusEl.textContent = '未找到结果';
						bangumiBtnText.textContent = ' 重新搜索';
						bangumiBtn.disabled = false;
						return;
					}

					statusEl.textContent = `找到 ${results.length} 个结果，点击选择封面：`;
					results.forEach(item => {
						if (!item.cover) return;
						addCoverOption(bangumiGrid, item.cover, item.name, false);
					});

					bangumiBtnText.textContent = ' 重新搜索';
					bangumiBtn.disabled = false;
				});
			}

			panel.querySelector('#cp-close').onclick = () => this.closeOverlay('cover-picker');
			panel.querySelector('#cp-cancel').onclick = () => this.closeOverlay('cover-picker');
			panel.querySelector('#cp-use-custom').onclick = () => {
				const url = panel.querySelector('#cp-custom-url').value.trim();
				if (!url) { toast('请输入图片 URL'); return; }
				onSelect(url); this.closeOverlay('cover-picker');
			};
		},

		/** 元数据搜索弹窗（Bangumi） */
		async openMetadataSearch(keyword, editPanel, d) {
			toast('正在搜索…');
			const results = await searchBangumi(keyword);
			if (!results.length) { toast('未找到匹配结果'); return; }

			const { ov, panel } = this.makeOverlay('meta-search', `
				<div class="panel-head">
					<div class="head-logo">${I.search}</div>
					<h2>搜索元数据 — ${escapeHTML(keyword)}</h2>
					<button class="btn-icon" id="ms-close">${I.x}</button>
				</div>
				<div class="panel-body">
					<p style="font-size:calc(var(--font-size)*0.786);color:var(--muted);margin-bottom:10px;">点击结果自动填充封面、总集数、评分等信息：</p>
					<div id="ms-results" class="stack"></div>
				</div>
				<div class="panel-foot">
					<button class="btn btn-ghost" id="ms-cancel">取消</button>
				</div>
			`, { panelClass: ' edit-panel', ariaLabel: '元数据搜索结果' });

			const resultsDiv = panel.querySelector('#ms-results');
			results.forEach(item => {
				const card = document.createElement('div');
				card.style.cssText = 'display:flex;gap:12px;padding:10px;border:1px solid var(--border);border-radius:var(--radius);cursor:pointer;transition:all 0.15s;background:var(--surface);';
				card.innerHTML = `
					<div style="width:60px;height:80px;border-radius:6px;overflow:hidden;flex-shrink:0;background:var(--surface-hi);">
						${item.cover ? `<img src="${item.cover}" style="width:100%;height:100%;object-fit:cover;" onerror="this.style.display='none'" referrerpolicy="no-referrer">` : '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:var(--muted);">🎬</div>'}
					</div>
					<div style="flex:1;min-width:0;">
						<div style="font-weight:600;font-size:calc(var(--font-size)*0.929);margin-bottom:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHTML(item.name)}</div>
						${item.nameOriginal !== item.name ? `<div style="font-size:calc(var(--font-size)*0.714);color:var(--muted);margin-bottom:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHTML(item.nameOriginal)}</div>` : ''}
						<div class="muted-text">
							${item.date ? `放送：${item.date}` : ''}
							${item.rating ? ` · 评分：${item.rating}` : ''}
						</div>
						${item.summary ? `<div style="font-size:calc(var(--font-size)*0.714);color:var(--muted);margin-top:4px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${escapeHTML(item.summary)}</div>` : ''}
					</div>
				`;
				card.addEventListener('mouseenter', () => { card.style.borderColor = 'var(--accent)'; card.style.background = 'var(--accent-dim)'; });
				card.addEventListener('mouseleave', () => { card.style.borderColor = 'var(--border)'; card.style.background = 'var(--surface)'; });
				card.addEventListener('click', async () => {
					// 更新剧名
					const nameInput = editPanel.querySelector('#e-name');
					if (nameInput && item.name) nameInput.value = item.name;
					d.name = item.name;
					// 填充类型（如有）
					if (item.type) {
						const typeSelect = editPanel.querySelector('#e-type');
						if (typeSelect) {
							const opt = [...typeSelect.options].find(o => o.value === item.type);
							if (opt) typeSelect.value = item.type;
						}
					}
					// 填充封面（如有）
					if (item.cover) {
						const coverInput = editPanel.querySelector('#e-cover');
						if (coverInput) coverInput.value = item.cover;
						d.coverUrl = item.cover;
					}
					// 获取详情（总集数、更新周期）
					toast('正在获取详情…');
					const detail = await getBangumiDetail(item.id);
					if (detail?.eps) {
						const totalInput = editPanel.querySelector('#e-total');
						if (totalInput) totalInput.value = detail.eps;
					}
					if (detail?.schedule) {
						const scheduleSelect = editPanel.querySelector('#e-schedule');
						if (scheduleSelect) scheduleSelect.value = detail.schedule;
					}
					this.closeOverlay('meta-search');
					toast(`已填充《${item.name}》的元数据，可手动微调`);
				});
				resultsDiv.appendChild(card);
			});

			panel.querySelector('#ms-close').onclick = () => this.closeOverlay('meta-search');
			panel.querySelector('#ms-cancel').onclick = () => this.closeOverlay('meta-search');
		},

		/** 构建编辑表单 HTML */
		buildEditFormHTML(d, isQuick, useClean, isAdd) {
			const title = isAdd ? '添加条目' : isQuick ? '快速记录' : '编辑剧集';
			const icon = isAdd ? I.plus : isQuick ? I.zap : I.edit;
			const typeOptionsHtml = state.settings.dict.types.map(t => {
				const tn = typeof t === 'string' ? t : t.name;
				return `<option value="${escapeHTML(tn)}" ${(d.type === tn || (!d.type && tn === (typeof state.settings.dict.types[0] === 'string' ? state.settings.dict.types[0] : state.settings.dict.types[0].name))) ? 'selected' : ''}>${escapeHTML(tn)}</option>`;
			}).join('');

			let bodyHtml = `<div class="panel-body">`;

			if (isQuick) {
				bodyHtml += `
                    <div class="extract-card">
                        <div class="extract-icon">${I.eye}</div>
                        <div>
                            <div class="extract-text">已从当前页面提取信息</div>
                            <div class="extract-url">${escapeHTML(d.url || '')}</div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="cb-row"><input type="checkbox" id="e-auto-clean" ${useClean ? 'checked' : ''}> 启用标题正则清洗</label>
                    </div>`;
			}

			bodyHtml += `
                <div class="form-row">
                    <div class="form-group" style="flex:2">
                        <label class="form-label required">剧名</label>
                        <div class="inline-row">
                            <input type="text" id="e-name" value="${escapeHTML(d.name || '')}" placeholder="剧集名称" class="flex-1">
                            <button class="btn-icon" id="e-search-meta" title="搜索元数据">${I.search}</button>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">类型</label>
                        <select id="e-type">${typeOptionsHtml}</select>
                    </div>
                </div>`;

			if (isQuick) {
				bodyHtml += `
                    <div class="form-row" style="align-items:flex-end;">
                        <div class="form-group" style="flex:2;">
                            <label class="form-label">当前集数</label>
                            <div style="display:flex;gap:4px;align-items:center;">
                                <input type="number" id="e-currep" value="${d.currentEpisode || 1}" min="0" style="flex:1;text-align:center;">
                                <button type="button" class="btn-icon accent-btn" id="e-ep-dec">−1</button>
                                <button type="button" class="btn-icon accent-btn" id="e-ep-inc">+1</button>
                            </div>
                            ${Array.isArray(d._candidates) && d._candidates.length > 1 ? '<div id="e-ep-candidates" style="display:flex;gap:4px;margin-top:4px;flex-wrap:wrap;"></div>' : '<div id="e-ep-candidates" style="display:none;"></div>'}
                        </div>
                        <div class="form-group">
                            <label class="form-label">总集数</label>
                            <input type="number" id="e-total" value="${d.latestEpisode || ''}">
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">封面图片 URL（可选）</label>
                        <div class="inline-row">
                            <input type="text" id="e-cover" value="${escapeHTML(d.coverUrl || '')}" placeholder="留空自动生成占位封面" class="flex-1">
                            <button class="btn-icon" id="e-cover-picker" title="从页面选择封面">${I.image}</button>
                        </div>
                    </div>`;
			}

			if (isAdd || !isQuick) {
				bodyHtml += `
                    <div class="form-row" style="align-items:flex-end;">
                        <div class="form-group" style="flex:2;">
                            <label class="form-label">已看集数</label>
                            <div style="display:flex;gap:4px;align-items:center;">
                                <input type="number" id="e-currep" value="${d.currentEpisode || 0}" min="0" style="flex:1;text-align:center;">
                                <button type="button" class="btn-icon accent-btn" id="e-ep-dec">−1</button>
                                <button type="button" class="btn-icon accent-btn" id="e-ep-inc">+1</button>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">总集数</label>
                            <input type="number" id="e-total" value="${d.latestEpisode || ''}">
                        </div>
                    </div>
                    <div class="form-row" style="align-items:flex-end;">
                        <div class="form-group">
                            <label class="form-label">状态</label>
                            <select id="e-status">${state.settings.dict.statuses.map(s => `<option value="${s.id}" ${d.status === s.id ? 'selected' : ''}>${s.label}</option>`).join('')}</select>
                        </div>
                        <div class="form-group" id="e-schedule-group">
                            <label class="form-label">更新周期</label>
                            <select id="e-schedule">
                                <option value="unset">未设置</option>
                                <option value="Mon">周一更新</option>
                                <option value="Tue">周二更新</option>
                                <option value="Wed">周三更新</option>
                                <option value="Thu">周四更新</option>
                                <option value="Fri">周五更新</option>
                                <option value="Sat">周六更新</option>
                                <option value="Sun">周日更新</option>
                                <option value="daily">每天更新</option>
                                <option value="finished">已完结</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">我的评分</label>
                        <div class="rating" id="e-rating">${[1, 2, 3, 4, 5].map(n => `<div class="star ${(d.rating || 0) >= n ? 'on' : ''}" data-v="${n}">${I.star}</div>`).join('')}</div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">封面图片 URL</label>
                        <div class="inline-row">
                            <input type="text" id="e-cover" value="${escapeHTML(d.coverUrl || '')}" placeholder="留空自动生成占位封面" class="flex-1">
                            <button class="btn-icon" id="e-cover-picker" title="从页面选择封面">${I.image}</button>
                        </div>
                    </div>`;
			}

			if (!isQuick && !isAdd) {
				const linkCount = (d.links || []).length;
				bodyHtml += `
                    <div class="form-group">
                        <details id="e-links-details" ${linkCount ? '' : 'open'}>
                            <summary class="link-summary">播放链接（${linkCount}条）</summary>
                            <div id="e-links"></div>
                            <button class="btn btn-ghost" id="e-addlink" style="width:100%;margin-top:5px;justify-content:center;">${I.plus} 添加链接</button>
                        </details>
                    </div>`;
			}

			if (isAdd || !isQuick) {
				bodyHtml += `
                    <div class="form-group">
                        <label class="form-label">备注</label>
                        <textarea id="e-notes" rows="2">${escapeHTML(d.notes || '')}</textarea>
                    </div>`;
				// 观看历史
				const hist = Array.isArray(d.history) ? [...d.history].reverse().slice(0, 15) : [];
				if (hist.length) {
					const histItems = hist.map(h => {
						const dt = new Date(h.ts);
						const dateStr = dt.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
						return `<div class="hist-item" data-ts="${h.ts}" style="display:flex;align-items:center;gap:6px;padding:3px 0;font-size:calc(var(--font-size)*0.786);color:var(--muted);"><span style="color:var(--accent);font-weight:600;min-width:42px;">第${h.ep}集</span><span class="flex-1">${dateStr}</span><button class="btn-icon hist-del" title="删除此记录" style="color:#f87171;border-color:rgba(239,68,68,0.2);padding:2px;">${I.trash}</button></div>`;
					}).join('');
					bodyHtml += `
                    <details class="hist-details" style="margin-top:4px;">
                        <summary class="link-summary">📜 观看历史（${(d.history || []).length}条）</summary>
                        <div style="padding:6px 0 2px;">${histItems}</div>
                    </details>`;
				}
			}

			bodyHtml += `</div>`;

			return `
                <div class="panel-head">
                    <div class="head-logo">${icon}</div>
                    <h2>${title}</h2>
                    <button class="btn-icon" id="e-close">${I.x}</button>
                </div>
                ${bodyHtml}
                <div class="panel-foot">
                    <button class="btn btn-ghost" id="e-cancel">取消</button>
                    ${isQuick ? `<button class="btn btn-ghost" id="e-reparse">${I.zap} 重新解析</button>` : ''}
                    ${isQuick ? `<button class="btn btn-icon" id="e-open-main" title="打开管理面板">${I.compass}</button>` : ''}
                    <button class="btn btn-primary ml-auto" id="e-save">${I.check} 保存</button>
                </div>
            `;
		},

		/** 绑定编辑表单交互事件 */
		bindEditFormEvents(panel, d, isQuick, isAdd) {
			// 星级评分交互
			const stars = panel.querySelectorAll('.star');
			d._rating = d.rating || 0;
			stars.forEach(star => {
				star.onclick = () => {
					const v = parseInt(star.dataset.v);
					d._rating = (d._rating === v) ? 0 : v;
					stars.forEach((s, i) => s.classList.toggle('on', i < d._rating));
				};
				star.onmouseenter = () => { const v = parseInt(star.dataset.v); stars.forEach((s, i) => s.style.color = i < v ? '#fbbf24' : ''); };
				star.onmouseleave = () => stars.forEach(s => s.style.color = '');
			});

			// 更新周期显示逻辑
			const typeSelect = panel.querySelector('#e-type');
			const scheduleGroup = panel.querySelector('#e-schedule-group');
			d._scheduleSelect = panel.querySelector('#e-schedule');
			if (d._scheduleSelect) d._scheduleSelect.value = d.schedule || 'unset';

			const updateScheduleVisibility = () => {
				const singleTypes = state.settings.dict.types.filter(t => (typeof t === 'string' ? false : t.single)).map(t => typeof t === 'string' ? t : t.name);
				if (singleTypes.includes(typeSelect.value)) {
					if (d._scheduleSelect) d._scheduleSelect.value = 'finished';
					if (scheduleGroup) scheduleGroup.style.display = 'none';
				} else {
					if (scheduleGroup) scheduleGroup.style.display = 'block';
					if (d._scheduleSelect && d._scheduleSelect.value === 'finished') d._scheduleSelect.value = 'unset';
				}
			};
			if (typeSelect) {
				typeSelect.addEventListener('change', updateScheduleVisibility);
				updateScheduleVisibility();
			}

			// 集数候选快捷选择
			const candidatesContainer = panel.querySelector('#e-ep-candidates');
			if (candidatesContainer && Array.isArray(d._candidates) && d._candidates.length > 1) {
				const curInput = panel.querySelector('#e-currep');
				d._candidates.forEach((num, i) => {
					const btn = document.createElement('button');
					btn.type = 'button'; btn.className = 'btn-ghost';
					btn.style.cssText = 'padding:3px 8px;font-size:calc(var(--font-size)*0.786);';
					btn.textContent = `第${num}集`;
					if (i === 0) btn.style.borderColor = 'var(--accent)';
					btn.addEventListener('click', () => {
						curInput.value = num;
						candidatesContainer.querySelectorAll('button').forEach(b => { b.style.borderColor = 'var(--border)'; b.style.background = 'transparent'; });
						btn.style.borderColor = 'var(--accent)'; btn.style.background = 'var(--accent-dim)';
					});
					candidatesContainer.appendChild(btn);
				});
			}

			const nameInput = panel.querySelector('#e-name');

			// 封面选择器
			const coverPickerBtn = panel.querySelector('#e-cover-picker');
			if (coverPickerBtn) {
				coverPickerBtn.addEventListener('click', () => {
					const currentName = nameInput?.value.trim() || d.name || '';
					this.openCoverPicker(currentName, (selectedUrl) => {
						const coverInput = panel.querySelector('#e-cover');
						if (coverInput) coverInput.value = selectedUrl;
					});
				});
			}

			// 元数据搜索（Bangumi）
			const searchMetaBtn = panel.querySelector('#e-search-meta');
			if (searchMetaBtn) {
				searchMetaBtn.addEventListener('click', () => {
					const keyword = nameInput?.value.trim() || d.name || '';
					if (!keyword) { toast('请先输入剧名'); return; }
					this.openMetadataSearch(keyword, panel, d);
				});
			}

			// 重名检测提示
			if (nameInput && typeSelect) {
				const formRow = panel.querySelector('.form-row');
				let nameWarningWrapper = panel.querySelector('#name-warning-wrapper');
				if (!nameWarningWrapper) {
					nameWarningWrapper = document.createElement('div');
					nameWarningWrapper.id = 'name-warning-wrapper';
					nameWarningWrapper.style.cssText = 'display:none; margin-top: 4px; margin-bottom: 8px; width: 100%;';
					const nameWarning = document.createElement('div');
					nameWarning.className = 'name-warning-text';
					nameWarning.style.cssText = 'font-size: 0.75rem; line-height: 1.4; padding: 2px 0;';
					nameWarningWrapper.appendChild(nameWarning);
					if (formRow) {
						formRow.parentNode.insertBefore(nameWarningWrapper, formRow.nextSibling);
					} else {
						const nameInput2 = panel.querySelector('#e-name');
						if (nameInput2?.parentNode) nameInput2.parentNode.insertBefore(nameWarningWrapper, nameInput2.nextSibling);
					}
				}
				const nameWarning = nameWarningWrapper.querySelector('.name-warning-text');

				const checkDuplicate = () => {
					const newName = nameInput.value.trim();
					const currentType = typeSelect.value;
					if (!newName) { nameWarningWrapper.style.display = 'none'; return; }
					const exact = state.shows.find(s => s.name === newName && s.type === currentType && (isAdd ? true : s.id !== d.id));
					const diff = state.shows.filter(s => s.name === newName && s.type !== currentType && (isAdd ? true : s.id !== d.id));

					if (exact) {
						if (isQuick) {
							nameWarning.innerHTML = '✅将更新已有剧集的观看进度（封面、备注等保持不变）';
							nameWarning.style.color = '#008b33ff';
						} else {
							nameWarning.innerHTML = '⚠️相同剧名和类型已存在，保存时将提示冲突';
							nameWarning.style.color = '#d31f1fff';
						}
						nameWarningWrapper.style.display = 'block';
					} else if (diff.length > 0) {
						const typeList = diff.map(s => `「${escapeHTML(s.type)}」`).join('、');
						if (isQuick) {
							nameWarning.innerHTML = `💡已有同名${typeList}，将作为不同版本独立存在（互不影响）`;
						} else {
							nameWarning.innerHTML = `💡已有同名${typeList}，将作为不同版本共存`;
						}
						nameWarning.style.color = '#d39803ff';
						nameWarningWrapper.style.display = 'block';
					} else {
						nameWarningWrapper.style.display = 'none';
					}
				};
				nameInput.addEventListener('input', checkDuplicate);
				typeSelect.addEventListener('change', checkDuplicate);
				setTimeout(checkDuplicate, 100);
			}

			// 电影/纪录片自动锁定总集数为 1
			const totalInput = panel.querySelector('#e-total');
			if (typeSelect && totalInput) {
				const handleTypeChange = () => {
					const singleTypes = state.settings.dict.types.filter(t => (typeof t === 'string' ? false : t.single)).map(t => typeof t === 'string' ? t : t.name);
					if (singleTypes.includes(typeSelect.value)) { totalInput.value = '1'; totalInput.readOnly = true; }
					else { totalInput.readOnly = false; }
				};
				typeSelect.addEventListener('change', handleTypeChange);
				if (isAdd) handleTypeChange();
			}

			// 播放链接管理
			const linksContainer = panel.querySelector('#e-links');
			if (linksContainer) {
				const updatePlatTag = (tagEl, url) => {
					const pl = findPlatformByUrl(url);
					if (pl) {
						tagEl.className = 'link-plat-tag';
						const cat = getPlatformCategory(pl.category);
						if (cat && cat.color) {
							tagEl.style.background = `${cat.color}22`;
							tagEl.style.color = cat.color;
						} else {
							tagEl.style.background = '';
							tagEl.style.color = '';
						}
						tagEl.title = `所属平台：${pl.name}`;
						tagEl.innerHTML = `${I.tag}<span>${escapeHTML(pl.name)}</span>`;
					} else {
						tagEl.className = 'link-plat-tag unknown';
						tagEl.style.background = '';
						tagEl.style.color = '';
						tagEl.title = '未匹配到已添加的观影平台';
						tagEl.innerHTML = `${I.tag}<span>未匹配</span>`;
					}
				};
				const renderLinks = () => {
					linksContainer.innerHTML = '';
					const pinnedIdx = d.pinnedLinkIdx ?? -1;
					const sorted = [...d.links].map((lk, i) => ({ lk, origIdx: i })).sort((a, b) => {
						if (a.origIdx === pinnedIdx) return -1;
						if (b.origIdx === pinnedIdx) return 1;
						return (b.lk.episode || 0) - (a.lk.episode || 0);
					});
					sorted.forEach(({ lk, origIdx }) => {
						const row = document.createElement('div');
						row.className = 'link-row' + (origIdx === pinnedIdx ? ' pinned' : '');

						// 解析初始协议和路径部分
						let proto = 'https://';
						let urlPart = '';
						if (lk.url && /^https?:\/\//i.test(lk.url)) {
							const m = lk.url.match(/^(https?:\/\/)/i);
							proto = m[1].toLowerCase();
							urlPart = lk.url.slice(proto.length);
						} else {
							urlPart = lk.url || '';
						}

						row.innerHTML = `
                            <div class="link-head">
                                <span class="link-plat-tag unknown" title="未匹配到已添加的观影平台">${I.tag}<span>未匹配</span></span>
                                <button class="btn-icon pin-btn ${origIdx === pinnedIdx ? 'active' : ''}" title="置顶此链接" style="margin-left:auto">${I.pin}</button>
                                <button class="btn-icon" title="在新标签页打开">${I.extLink}</button>
                                <button class="btn-icon" style="color:#f87171;border-color:rgba(239,68,68,0.25);" title="删除">${I.trash}</button>
                            </div>
                            <div class="link-body">
                                <div class="proto-input-wrap" style="flex:2;">
                                    <button type="button" class="proto-switch" title="点击切换协议">${proto}</button>
                                    <input type="text" value="${escapeHTML(urlPart)}" placeholder="主机/路径" class="flex-1">
                                </div>
                                <input type="number" value="${lk.episode || 0}" placeholder="集数" style="width:66px;flex:0 0 66px;">
                            </div>
                        `;
						const platTag = row.querySelector('.link-plat-tag');
						const protoBtn = row.querySelector('.proto-switch');
						const urlInput = row.querySelector('.proto-input-wrap input[type="text"]');
						const epInput = row.querySelector('.link-body input[type="number"]');
						const pinBtn = row.querySelector('.pin-btn');
						updatePlatTag(platTag, lk.url || '');

						pinBtn.onclick = () => {
							d.pinnedLinkIdx = (d.pinnedLinkIdx === origIdx) ? -1 : origIdx;
							renderLinks();
						};

						protoBtn.onclick = () => {
							const PROTOCOLS = ['https://', 'http://'];
							const idx = PROTOCOLS.indexOf(proto);
							proto = PROTOCOLS[(idx + 1) % PROTOCOLS.length];
							protoBtn.textContent = proto;
							lk.url = proto + urlInput.value.trim();
							updatePlatTag(platTag, lk.url);
						};

						urlInput.oninput = () => {
							const val = urlInput.value.trim();
							if (/^https?:\/\//i.test(val)) {
								const m = val.match(/^(https?:\/\/)/i);
								proto = m[1].toLowerCase();
								protoBtn.textContent = proto;
								urlInput.value = val.slice(proto.length);
							}
							lk.url = proto + urlInput.value.trim();
							updatePlatTag(platTag, lk.url);
						};

						urlInput.onblur = () => {
							const val = urlInput.value.trim();
							if (/^https?:\/\//i.test(val)) {
								const m = val.match(/^(https?:\/\/)/i);
								proto = m[1].toLowerCase();
								protoBtn.textContent = proto;
								urlInput.value = val.slice(proto.length);
							}
							lk.url = proto + urlInput.value.trim();
						};

						epInput.oninput = () => { lk.episode = parseInt(epInput.value) || 0; };
						row.querySelectorAll('.btn-icon:not(.pin-btn)')[0].onclick = () => { if (lk.url) window.open(lk.url, '_blank'); else toast('链接为空'); };
						row.querySelectorAll('.btn-icon:not(.pin-btn)')[1].onclick = () => {
							const i = d.links.indexOf(lk);
							if (i !== -1) {
								if (d.pinnedLinkIdx === i) d.pinnedLinkIdx = 0;
								else if (d.pinnedLinkIdx > i) d.pinnedLinkIdx--;
								d.links.splice(i, 1);
								if (d.pinnedLinkIdx >= d.links.length) d.pinnedLinkIdx = Math.max(0, d.links.length - 1);
								if (d.links.length) {
									const maxEp = Math.max(...d.links.map(l => l.episode || 0));
									if (maxEp > 0) d.currentEpisode = maxEp;
								}
								renderLinks();
							}
						};
						linksContainer.appendChild(row);
					});
					// 更新 details 摘要计数
					const det = linksContainer.closest('details');
					if (det) det.querySelector('summary').textContent = `播放链接（${d.links.length}条）`;
				};
				renderLinks();
				panel.querySelector('#e-addlink').onclick = () => {
					d.links.push({ url: '', episode: 0 }); renderLinks();
					const det = panel.querySelector('#e-links-details');
					if (det) det.open = true;
				};
			}

			// 观看历史删除
			const histDetails = panel.querySelector('.hist-details');
			if (histDetails) {
				histDetails.addEventListener('click', e => {
					const delBtn = e.target.closest('.hist-del');
					if (!delBtn) return;
					const item = delBtn.closest('.hist-item');
					const ts = parseInt(item.dataset.ts);
					if (d.history) d.history = d.history.filter(h => h.ts !== ts);
					item.remove();
					const count = histDetails.querySelectorAll('.hist-item').length;
					histDetails.querySelector('summary').textContent = `📜 观看历史（${count}条）`;
					if (!count) histDetails.remove();
				});
			}

			// 集数 ±1 按钮
			const epDecBtn = panel.querySelector('#e-ep-dec');
			const epIncBtn = panel.querySelector('#e-ep-inc');
			const epInput = panel.querySelector('#e-currep');
			if (epDecBtn && epInput) {
				epDecBtn.onclick = () => {
					const cur = parseInt(epInput.value) || 0;
					epInput.value = Math.max(0, cur - 1);
				};
			}
			if (epIncBtn && epInput) {
				epIncBtn.onclick = () => {
					const cur = parseInt(epInput.value) || 0;
					epInput.value = cur + 1;
				};
			}

			// 重新解析按钮
			if (isQuick) {
				panel.querySelector('#e-reparse').onclick = () => {
					const autoClean = panel.querySelector('#e-auto-clean')?.checked ?? true;
					this.closeOverlay('edit');
					this.openRecord(autoClean);
				};
			}

			// footer 按钮
			const btnSave = panel.querySelector('#e-save');
			const btnClose = panel.querySelector('#e-close');
			const btnCancel = panel.querySelector('#e-cancel');
			if (btnSave) btnSave.onclick = () => this.saveShowData(panel, d, isQuick, isAdd);
			if (btnClose) btnClose.onclick = () => this.closeOverlay('edit');
			if (btnCancel) btnCancel.onclick = () => this.closeOverlay('edit');
			const openMainBtn = panel.querySelector('#e-open-main');
			if (openMainBtn) openMainBtn.onclick = () => { this.closeOverlay('edit'); this.openMain(!isTouchDevice); };
		},

		/** 保存剧集数据 */
		saveShowData(panel, d, isQuick, isAdd) {
			const name = panel.querySelector('#e-name')?.value.trim();
			const currentType = panel.querySelector('#e-type')?.value || '';
			if (!name) { toast('剧名不能为空'); return; }
			const rating = d._rating || 0;
			const scheduleSelect = d._scheduleSelect;

			if (isQuick) {
				const curEp = parseInt(panel.querySelector('#e-currep')?.value) || 1;
				const selectedType = currentType || (typeof state.settings.dict.types[0] === 'string' ? state.settings.dict.types[0] : state.settings.dict.types[0].name);
				const coverInputValue = panel.querySelector('#e-cover')?.value.trim() || '';
				const totalEpVal = panel.querySelector('#e-total')?.value;
				const latestEp = totalEpVal !== '' && totalEpVal !== undefined ? parseInt(totalEpVal) || null : null;

				const existing = state.shows.find(s => s.name === name && s.type === selectedType);
				if (existing) {
					existing.currentEpisode = Math.max(existing.currentEpisode || 0, curEp);
					if (latestEp !== null) existing.latestEpisode = latestEp;
					if (d.url) mergeShowLinks(existing, d.url, curEp);
					if (coverInputValue && coverInputValue.trim() !== '') existing.coverUrl = coverInputValue.trim();
					existing.updatedAt = Date.now();
					if (!Array.isArray(existing.history)) existing.history = [];
					existing.history.push({ ep: curEp, ts: Date.now() });
					saveData(); this.closeOverlay('edit'); this.renderShows();
					toast(`✅ 已更新《${name}》至第${existing.currentEpisode}集`);
					return;
				} else {
					state.shows.unshift({
						id: uid(), name, type: selectedType, currentEpisode: curEp,
						latestEpisode: latestEp, status: 'watching', coverUrl: coverInputValue,
						links: d.url ? [{ url: d.url, episode: curEp }] : [],
						rating: 0, notes: '', schedule: 'unset',
						history: [{ ep: curEp, ts: Date.now() }],
						createdAt: Date.now(), updatedAt: Date.now(),
					});
					saveData(); this.closeOverlay('edit'); this.renderShows();
					toast(`✅ 已添加《${name}》（${selectedType}）`);
					return;
				}
			}

			// 编辑/新增模式
			const exactDuplicate = state.shows.find(s => s.name === name && s.type === currentType && (isAdd ? true : s.id !== d.id));
			const sameNameDiffType = state.shows.filter(s => s.name === name && s.type !== currentType && (isAdd ? true : s.id !== d.id));

			if (exactDuplicate) {
				if (isAdd) {
					if (!confirm(`《${name}》（${currentType}）已存在！\n\n点击"确定"合并进度到现有条目\n点击"取消"放弃添加`)) return;
					const curEp = parseInt(panel.querySelector('#e-currep')?.value) || 0;
					const latestEp = parseInt(panel.querySelector('#e-total')?.value) || null;
					const notes = panel.querySelector('#e-notes')?.value.trim() || '';
					const coverUrl = panel.querySelector('#e-cover')?.value.trim() || '';
					exactDuplicate.currentEpisode = Math.max(exactDuplicate.currentEpisode || 0, curEp);
					if (latestEp && (!exactDuplicate.latestEpisode || latestEp > exactDuplicate.latestEpisode)) exactDuplicate.latestEpisode = latestEp;
					if (rating > (exactDuplicate.rating || 0)) exactDuplicate.rating = rating;
					if (notes && !exactDuplicate.notes?.includes(notes)) exactDuplicate.notes = exactDuplicate.notes ? `${exactDuplicate.notes}\n${notes}` : notes;
					if (coverUrl && (!exactDuplicate.coverUrl || exactDuplicate.coverUrl === generateCoverDataURL(exactDuplicate.name))) exactDuplicate.coverUrl = coverUrl;
					if (d.links) d.links.forEach(link => { if (link.url?.trim()) mergeShowLinks(exactDuplicate, link.url, link.episode); });
					exactDuplicate.updatedAt = Date.now();
					saveData(); this.closeOverlay('edit'); this.renderShows();
					toast(`✅ 已合并到《${name}》`);
					return;
				} else {
					toast(`❌ 无法保存！《${name}》（${currentType}）已存在`, 3000);
					return;
				}
			}

			if (sameNameDiffType.length > 0) {
				const diffTypeNames = sameNameDiffType.map(s => `「${s.type}」`).join('、');
				if (!confirm(`⚠️ 已有同名但不同类型的剧集：${diffTypeNames}\n当前：${currentType}\n\n点击"确定"继续添加（独立存在）\n点击"取消"返回修改`)) return;
			}

			const status = panel.querySelector('#e-status')?.value || d.status;
			const latestEpisode = parseInt(panel.querySelector('#e-total')?.value) || null;
			const currentEpisode = parseInt(panel.querySelector('#e-currep')?.value) || 0;
			const coverUrl = panel.querySelector('#e-cover')?.value.trim() || d.coverUrl || '';
			const notes = panel.querySelector('#e-notes')?.value.trim() || '';
			const schedule = scheduleSelect ? scheduleSelect.value : (d.schedule || 'unset');
			if (d.links) { d.links = d.links.filter(l => l.url?.trim()); sortLinks(d.links); }

			const payload = { name, type: currentType, currentEpisode, latestEpisode, status, rating, coverUrl, notes, schedule, links: d.links || [], pinnedLinkIdx: d.pinnedLinkIdx ?? -1, history: d.history || [], updatedAt: Date.now() };

			if (isAdd) {
				state.shows.unshift({ id: uid(), createdAt: Date.now(), history: currentEpisode ? [{ ep: currentEpisode, ts: Date.now() }] : [], ...payload });
				toast(`已添加《${name}》`);
			} else {
				const idx = state.shows.findIndex(s => s.id === d.id);
				if (idx !== -1) {
					const oldEp = state.shows[idx].currentEpisode || 0;
					Object.assign(state.shows[idx], payload);
					if (currentEpisode && currentEpisode !== oldEp) {
						if (!Array.isArray(state.shows[idx].history)) state.shows[idx].history = [];
						state.shows[idx].history.push({ ep: currentEpisode, ts: Date.now() });
					}
					toast(`已更新《${name}》`);
				}
				else { toast('保存失败：找不到该条目'); return; }
			}
			saveData(); this.closeOverlay('edit'); this.renderShows();
		},

		openEdit(data, isQuick = false, useClean = true, isAdd = false) {
			const d = JSON.parse(JSON.stringify(data));
			if (!Array.isArray(d.links)) d.links = [];
			if (!d.rating) d.rating = 0;
			if (!d.notes) d.notes = '';
			if (!d.schedule) d.schedule = 'unset';
			if (isQuick && d.url && !d.links.length) {
				d.links = [{ url: d.url, episode: d.currentEpisode || 1 }];
			}

			const html = this.buildEditFormHTML(d, isQuick, useClean, isAdd);
			const { ov, panel } = this.makeOverlay('edit', html, { panelClass: ' edit-panel', initialFocus: isQuick ? (isTouchDevice ? null : '#e-currep') : undefined });
			this.bindEditFormEvents(panel, d, isQuick, isAdd);

		},

		// ══════════════════════════════════════════════════
		//  PLATFORM METHODS
		// ══════════════════════════════════════════════════
		renderPlatforms(panel) {
			if (!panel) panel = this.overlays.main?.querySelector('.panel');
			if (!panel) return;
			const container = panel.querySelector('#platforms-container');
			if (!container) return;

			// 动态更新分类筛选按钮（支持实时同步设置修改）
			const actionsBar = panel.querySelector('.platform-actions-bar');
			if (actionsBar) {
				let activeCat = 'all';
				const activeBtn = actionsBar.querySelector('.plat-filter-btn.active');
				if (activeBtn && activeBtn.dataset.cat) {
					activeCat = activeBtn.dataset.cat;
					if (activeCat !== 'all' && !state.platformCategories.some(c => c.id === activeCat)) {
						activeCat = 'all';
					}
				}

				actionsBar.querySelectorAll('.plat-filter-btn[data-cat]:not([data-cat="all"])').forEach(btn => btn.remove());

				// 生成新的分类按钮
				const catBtnsHtml = (state.platformCategories || []).map(cat =>
					`<button class="plat-filter-btn${activeCat === cat.id ? ' active' : ''}" data-cat="${cat.id}">${cat.name}</button>`
				).join('');

				// 插入到“全部”按钮之后、“管理分类”按钮之前
				const allBtn = actionsBar.querySelector('.plat-filter-btn[data-cat="all"]');
				const manageBtn = actionsBar.querySelector('#p-manage-cats');
				if (allBtn) {
					allBtn.insertAdjacentHTML('afterend', catBtnsHtml);
				} else if (manageBtn) {
					manageBtn.insertAdjacentHTML('beforebegin', catBtnsHtml);
				} else {
					actionsBar.insertAdjacentHTML('beforeend', catBtnsHtml);
				}

				// 重新绑定所有分类按钮的点击事件（包括“全部”和动态按钮）
				const allCatBtns = actionsBar.querySelectorAll('.plat-filter-btn[data-cat]');
				allCatBtns.forEach(btn => {
					btn.addEventListener('click', () => {
						allCatBtns.forEach(b => b.classList.remove('active'));
						btn.classList.add('active');
						this.renderPlatforms(panel);
					});
				});

				const allBtnEl = actionsBar.querySelector('.plat-filter-btn[data-cat="all"]');
				if (allBtnEl) allBtnEl.classList.toggle('active', activeCat === 'all');
			}

			const catFilter = panel.querySelector('.plat-filter-btn.active')?.dataset.cat || 'all';
			const searchVal = (panel.querySelector('#p-search')?.value || '').trim().toLowerCase();
			let platforms = [...state.platforms].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
			if (catFilter !== 'all') platforms = platforms.filter(p => p.category === catFilter);
			if (searchVal) platforms = platforms.filter(p => p.name.toLowerCase().includes(searchVal));

			container.innerHTML = '';
			if (!platforms.length) {
				container.innerHTML = `<div class="empty-state"><div class="empty-icon">${I.compass}</div><div class="empty-title">${searchVal || catFilter !== 'all' ? '没有匹配的平台' : '添加你常用的观影平台'}</div><div class="empty-sub">${searchVal || catFilter !== 'all' ? '调整搜索关键词或分类筛选试试' : ''}</div>${!searchVal && catFilter === 'all' ? `<div style="display:flex;flex-direction:column;gap:6px;margin-top:14px;text-align:left;max-width:480px;"><div class="meta-row"><span class="dot-accent"></span>点击左下方「添加平台」手动添加视频平台</div><div class="meta-row"><span class="dot-accent"></span>按 <kbd class="kbd">Shift+G</kbd> 快速打开【观影平台】</div><div class="meta-row"><span class="dot-accent"></span>支持平台自定义分类、图标获取与拖拽排序</div></div>` : ''}</div>`;
				const footInfo = panel.querySelector('#m-foot-info');
				if (footInfo) footInfo.textContent = `${platforms.length} 个平台`;
				const lastEl = panel.querySelector('#m-last-update');
				if (lastEl) lastEl.textContent = formatLastUpdated();
				return;
			}

			const grid = document.createElement('div'); grid.className = 'platforms-grid';
			platforms.forEach((p, idx) => {
				const cat = getPlatformCategory(p.category);
				const catName = cat ? cat.name : (p.category || '其他');
				const catColor = cat ? cat.color : '#f59e0b';
				const isMainstream = p.category === 'mainstream';
				const useCustomColor = isMainstream && cat?.customColor;
				const tagColor = isMainstream ? (useCustomColor ? catColor : 'var(--accent)') : catColor;

				const card = document.createElement('div');
				card.className = 'platform-card'; card.dataset.category = p.category;
				card.draggable = true; card.dataset.id = p.id;
				card.style.animationDelay = `${idx * ANIM_DELAY_PLATFORM}ms`;
				card.style.borderBottomColor = tagColor;
				card.innerHTML = `
                    <div class="platform-actions">
                        <button class="btn-icon edit-plat" title="编辑">${I.edit}</button>
                        <button class="btn-icon del-plat"  title="删除" style="color:#f87171;border-color:rgba(239,68,68,0.2);">${I.trash}</button>
                    </div>
                    <div class="platform-category-tag" style="background:${tagColor}22;color:${tagColor};">${catName}</div>
                    <div class="platform-name">${escapeHTML(p.name)}</div>
                `;

				const iconDiv = document.createElement('div'); iconDiv.className = 'platform-icon';
				if (p.icon) {
					if (/^(https?:|data:)/.test(p.icon)) {
						const img = document.createElement('img'); img.src = p.icon; img.alt = '';
						img.onerror = () => { iconDiv.textContent = '🌐'; };
						iconDiv.appendChild(img);
					} else { iconDiv.textContent = p.icon; }
				} else {
					const services = getFaviconServices(getPlatformUrl(p));
					let si = 0;
					const img = document.createElement('img'); img.alt = '';
					img.onerror = () => { si++; if (si < services.length) img.src = services[si]; else iconDiv.innerHTML = '<span style="font-size:18px">🌐</span>'; };
					img.src = services[0] || '';
					iconDiv.appendChild(img);
				}
				card.insertBefore(iconDiv, card.querySelector('.platform-category-tag'));

				card.addEventListener('click', e => {
					if (e.target.closest('button')) return;
					const openUrl = getPlatformUrl(p);
					if (openUrl) window.open(openUrl, '_blank');
				});
				card.querySelector('.edit-plat').addEventListener('click', e => { e.stopPropagation(); this.openPlatformEdit(p); });
				card.querySelector('.del-plat').addEventListener('click', e => {
					e.stopPropagation();
					const delIdx = state.platforms.findIndex(x => x.id === p.id);
					const delPlat = state.platforms[delIdx];
					state.platforms.splice(delIdx, 1);
					savePlatforms(); this.renderPlatforms(panel);
					showUndoToast(`已删除"${p.name}"`, () => {
						state.platforms.splice(delIdx, 0, delPlat);
						savePlatforms(); this.renderPlatforms(panel);
						toast(`已撤销：${p.name}已恢复`);
					});
				});

				card.addEventListener('dragstart', e => {
					this.dragSrcEl = card; e.dataTransfer.effectAllowed = 'move';
					e.dataTransfer.setData('text/plain', p.id); card.style.opacity = '0.4';
				});
				card.addEventListener('dragend', () => {
					card.style.opacity = '';
					grid.querySelectorAll('.platform-card').forEach(c => c.classList.remove('drag-over'));
					this.dragSrcEl = null;
				});
				card.addEventListener('dragover', e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; card.classList.add('drag-over'); });
				card.addEventListener('dragleave', () => card.classList.remove('drag-over'));
				card.addEventListener('drop', e => {
					e.preventDefault(); card.classList.remove('drag-over');
					if (this.dragSrcEl !== card) {
						const srcId = e.dataTransfer.getData('text/plain');
						const si = state.platforms.findIndex(x => x.id === srcId);
						const ti = state.platforms.findIndex(x => x.id === p.id);
						if (si !== -1 && ti !== -1) {
							const [moved] = state.platforms.splice(si, 1);
							state.platforms.splice(ti, 0, moved);
							state.platforms.forEach((item, i) => item.sortOrder = i);
							savePlatforms(); this.renderPlatforms(panel);
						}
					}
				});
				grid.appendChild(card);
			});
			container.appendChild(grid);

			const footInfo = panel.querySelector('#m-foot-info');
			if (footInfo) footInfo.textContent = `${platforms.length} 个平台`;
			const lastEl = panel.querySelector('#m-last-update');
			if (lastEl) lastEl.textContent = formatLastUpdated();
		},

		buildPlatformEditHTML(data, isNew) {
			const catOptions = state.platformCategories.map(cat =>
				`<option value="${cat.id}" ${data.category === cat.id ? 'selected' : ''}>${cat.name}</option>`
			).join('');
			return `
                <div class="panel-head">
                    <div class="head-logo">${isNew ? I.plus : I.edit}</div>
                    <h2>${isNew ? '添加平台' : '编辑平台'}</h2>
                    <button class="btn-icon" id="pe-close">${I.x}</button>
                </div>
                <div class="panel-body">
                    <div class="form-group">
                        <label class="form-label">分类</label>
                        <select id="pe-category">${catOptions}</select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">名称 *</label>
                        <input type="text" id="pe-name" value="${escapeHTML(data.name || '')}" placeholder="如：爱奇艺">
                    </div>
                    <div class="form-group">
                        <label class="form-label">网站链接 *</label>
                        <div id="pe-urls"></div>
                        <button class="btn btn-ghost" id="pe-add-url" class="btn-add-full">${I.plus} 添加链接</button>
                    </div>
                    <div class="form-group">
                        <label class="form-label">图标（留空自动多源匹配）</label>
                        <div class="inline-row">
                            <input type="text" id="pe-icon" value="${escapeHTML(data.icon || '')}" placeholder="图片URL / emoji / 文字符号">
                            <button class="btn-icon" id="pe-toggle-services" title="预览图标源">${I.eye}</button>
                        </div>
                        <div class="inline-row" style="gap:10px;margin-top:6px;">
                            <div class="platform-icon" style="width:40px;height:40px;font-size:18px;" id="pe-icon-preview">
                                ${data.icon ? (/^(https?:|data:)/.test(data.icon) ? '' : escapeHTML(data.icon)) : '🌐'}
                            </div>
                            <span class="muted-text">点击图标源可快速选择</span>
                        </div>
                        <div id="pe-services-row" style="display:none;flex-wrap:wrap;gap:6px;margin-top:8px;"></div>
                    </div>
                </div>
                <div class="panel-foot">
                    <button class="btn btn-ghost"   id="pe-cancel">取消</button>
                    <button class="btn btn-primary ml-auto" id="pe-save">${I.check} 保存</button>
                </div>`;
		},

		bindPlatformEditEvents(panel, data, isNew) {
			const iconInput = panel.querySelector('#pe-icon');
			const preview = panel.querySelector('#pe-icon-preview');
			const servicesRow = panel.querySelector('#pe-services-row');

			const updatePreview = (val) => {
				if (!val) { preview.textContent = '🌐'; return; }
				if (/^(https?:|data:)/.test(val)) { preview.innerHTML = ''; const img = document.createElement('img'); img.src = val; img.onerror = () => { preview.textContent = '🌐'; }; preview.appendChild(img); }
				else { preview.textContent = val; }
			};
			updatePreview(data.icon || '');
			iconInput.addEventListener('input', () => updatePreview(iconInput.value.trim()));

			panel.querySelector('#pe-toggle-services').addEventListener('click', () => {
				if (servicesRow.style.display === 'flex') { servicesRow.style.display = 'none'; return; }
				const firstRow = panel.querySelector('#pe-urls .pe-url-row');
				const urlVal = firstRow ? (firstRow.querySelector('.proto-switch').textContent + firstRow.querySelector('input[type="text"]').value.trim()) : '';
				if (!urlVal) { toast('请先填写网站 URL'); return; }
				const services = getFaviconServices(urlVal);
				if (!services.length) { toast('无效的 URL'); return; }
				servicesRow.innerHTML = '';
				services.forEach((srv, i) => {
					const wrap = document.createElement('div');
					wrap.style.cssText = 'width:34px;height:34px;border:1.5px solid var(--border);border-radius:6px;overflow:hidden;cursor:pointer;flex-shrink:0;';
					wrap.title = `图标源 ${i + 1}`;
					const img = document.createElement('img'); img.src = srv; img.style.cssText = 'width:100%;height:100%;object-fit:contain;';
					img.onerror = () => { wrap.style.display = 'none'; };
					wrap.appendChild(img);
					wrap.addEventListener('click', () => {
						iconInput.value = srv; updatePreview(srv);
						servicesRow.querySelectorAll('div').forEach(d => d.style.borderColor = 'var(--border)');
						wrap.style.borderColor = 'var(--accent)';
					});
					servicesRow.appendChild(wrap);
				});
				servicesRow.style.display = 'flex';
			});

			// 统一链接列表管理
			if (!data.urls || !data.urls.length) data.urls = [data.url || ''];
			if (data.pinnedUrlIdx === undefined) data.pinnedUrlIdx = 0;

			const urlsContainer = panel.querySelector('#pe-urls');
			const collectUrlsFromDOM = () => {
				const rows = urlsContainer.querySelectorAll('.pe-url-row');
				const urls = [];
				rows.forEach(row => {
					const p = row.querySelector('.proto-switch').textContent;
					const v = row.querySelector('input[type="text"]').value.trim();
					urls.push(v ? p + v : '');
				});
				data.urls = urls;
			};

			const collectPlatformUrls = () => {
				collectUrlsFromDOM();
				return data.urls.filter(u => u && u !== 'https://' && u !== 'http://');
			};

			const renderPlatformUrls = () => {
				urlsContainer.innerHTML = '';
				const pinnedIdx = data.pinnedUrlIdx ?? 0;
				data.urls.forEach((u, idx) => {
					let proto = 'https://';
					let urlPart = '';
					if (u && /^https?:\/\//i.test(u)) {
						const m = u.match(/^(https?:\/\/)/i);
						proto = m[1].toLowerCase();
						urlPart = u.slice(proto.length);
					} else { urlPart = u || ''; }

					const row = document.createElement('div');
					row.className = 'pe-url-row';
					row.style.cssText = 'display:flex;gap:6px;align-items:center;margin-bottom:6px;';
					row.innerHTML = `
                        <div class="proto-input-wrap flex-1">
                            <button type="button" class="proto-switch" title="点击切换协议">${proto}</button>
                            <input type="text" value="${escapeHTML(urlPart)}" placeholder="www.example.com/" class="flex-1">
                        </div>
                        <button class="btn-icon pin-btn ${idx === pinnedIdx ? 'active' : ''}" title="置顶此链接">${I.pin}</button>
                        <button class="btn-icon" title="删除" style="color:#f87171;border-color:rgba(239,68,68,0.25);">${I.trash}</button>
                    `;
					const protoBtn = row.querySelector('.proto-switch');
					const inp = row.querySelector('input[type="text"]');
					const pinBtn = row.querySelector('.pin-btn');
					const delBtn = row.querySelectorAll('.btn-icon')[1];

					protoBtn.onclick = () => {
						const PROTOCOLS = ['https://', 'http://'];
						const cur = protoBtn.textContent;
						protoBtn.textContent = PROTOCOLS[(PROTOCOLS.indexOf(cur) + 1) % PROTOCOLS.length];
					};

					pinBtn.onclick = () => {
						collectUrlsFromDOM();
						data.pinnedUrlIdx = idx;
						renderPlatformUrls();
					};

					delBtn.onclick = () => {
						collectUrlsFromDOM();
						data.urls.splice(idx, 1);
						if (!data.urls.length) data.urls.push('');
						if (data.pinnedUrlIdx >= data.urls.length) data.pinnedUrlIdx = data.urls.length - 1;
						else if (data.pinnedUrlIdx > idx) data.pinnedUrlIdx--;
						renderPlatformUrls();
					};

					inp.addEventListener('paste', () => {
						setTimeout(() => {
							const val = inp.value.trim();
							if (/^https?:\/\//i.test(val)) {
								const m = val.match(/^(https?:\/\/)/i);
								protoBtn.textContent = m[1].toLowerCase();
								inp.value = val.slice(m[1].length);
							}
						}, 0);
					});

					urlsContainer.appendChild(row);
				});
			};

			renderPlatformUrls();
			panel.querySelector('#pe-add-url').onclick = () => {
				collectUrlsFromDOM();
				data.urls.push('');
				renderPlatformUrls();
			};

			const close = () => this.closeOverlay('platform-edit');
			panel.querySelector('#pe-close').onclick = close;
			panel.querySelector('#pe-cancel').onclick = close;
			panel.querySelector('#pe-save').onclick = async () => {
				const name = panel.querySelector('#pe-name').value.trim();
				collectUrlsFromDOM();
				const validUrls = data.urls.filter(u => u && u !== 'https://' && u !== 'http://');
				if (!name || !validUrls.length) { toast('名称和链接不能为空'); return; }
				const pinnedUrlIdx = Math.min(data.pinnedUrlIdx ?? 0, validUrls.length - 1);
				const url = validUrls[pinnedUrlIdx];
				let icon = iconInput.value.trim();
				if (!icon) { toast('正在自动获取图标…'); icon = await fetchFavicon(url); }
				const selectedCat = panel.querySelector('#pe-category').value;
				const newData = { ...data, name, url, urls: validUrls, pinnedUrlIdx, category: selectedCat, icon, sortOrder: data.sortOrder ?? state.platforms.length };

				// 域名变化联动：仅在编辑（非新增）且 hostname 变化时触发
				if (!isNew) {
					const oldParts = parseUrlParts(data.url);
					const newParts = parseUrlParts(url);
					if (oldParts && newParts && oldParts.hostname !== newParts.hostname) {
						const matches = collectLinksByHost(oldParts.hostname);
						if (matches.length > 0) {
							this.openDomainMigrationDialog({
								oldUrl: data.url,
								newUrl: url,
								matches,
								platformDraft: newData,
								isNew,
								originalData: data,
								mainPanel: this.overlays.main?.querySelector('.panel') || null,
							});
							return;
						}
					}
				}

				if (isNew) state.platforms.push(newData);
				else { const i = state.platforms.findIndex(p => p.id === data.id); if (i !== -1) state.platforms[i] = newData; }
				savePlatforms(); close();
				if (this.overlays.main) {
					const mainPanel = this.overlays.main.querySelector('.panel');
					if (mainPanel) this.renderPlatforms(mainPanel);
				}
				toast(isNew ? `已添加"${name}"` : `已更新"${name}"`);
			};
		},

		openPlatformEdit(platform) {
			const isNew = !platform;
			const data = platform ? JSON.parse(JSON.stringify(platform)) : {
				id: uid(), category: state.platformCategories[0]?.id || 'mainstream',
				name: '', url: '', icon: '', sortOrder: state.platforms.length,
			};
			const html = this.buildPlatformEditHTML(data, isNew);
			const { ov, panel } = this.makeOverlay('platform-edit', html, { panelClass: ' edit-panel' });
			this.bindPlatformEditEvents(panel, data, isNew);
		},

		// ══════════════════════════════════════════════════
		//  DOMAIN MIGRATION（域名变更联动批量替换播放链接）
		// ══════════════════════════════════════════════════
		_formatUrlWithHostColor(url, hostColor) {
			const p = parseUrlParts(url);
			const safeUrl = escapeHTML(url);
			if (!p || !p.hostname) return safeUrl;
			const safeHost = escapeHTML(p.hostname);
			const re = new RegExp(safeHost.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
			return safeUrl.replace(re, m => `<span style="color:${hostColor};font-weight:700;">${m}</span>`);
		},

		_buildMigrationListHtml(matches, newParts) {
			return matches.map((m, idx) => `
                <label class="migrate-row" data-idx="${idx}" style="display:flex;gap:8px;align-items:flex-start;padding:8px 10px;border:1px solid var(--border);border-radius:8px;margin-bottom:6px;cursor:pointer;background:var(--surface);">
                    <input type="checkbox" data-idx="${idx}" checked style="margin-top:3px;flex-shrink:0;">
                    <div style="flex:1;min-width:0;">
                        <div style="font-weight:600;color:var(--text);font-size:calc(var(--font-size)*0.857);">${escapeHTML(m.show.name)} <span style="color:var(--muted);font-weight:400;font-size:calc(var(--font-size)*0.786);">· 第${m.link.episode || 0}集</span></div>
                        <div style="font-size:calc(var(--font-size)*0.72);color:var(--muted);text-decoration:line-through;word-break:break-all;margin-top:3px;line-height:1.4;">${this._formatUrlWithHostColor(m.link.url, '#f87171')}</div>
                        <div style="font-size:calc(var(--font-size)*0.72);color:#22c55e;word-break:break-all;margin-top:2px;line-height:1.4;">↓ ${this._formatUrlWithHostColor(rewriteUrlHost(m.link.url, newParts), '#22c55e')}</div>
                    </div>
                </label>
            `).join('');
		},

		openDomainMigrationDialog(args) {
			const { oldUrl, newUrl, matches, platformDraft, isNew, originalData, mainPanel } = args;
			const newParts = parseUrlParts(newUrl);
			if (!newParts) { toast('新 URL 无效'); return; }

			const selected = new Set(matches.map(m => m.link));
			const showCount = new Set(matches.map(m => m.show.id)).size;
			const listHtml = this._buildMigrationListHtml(matches, newParts);

			const html = `
                <div class="panel-head">
                    <div class="head-logo">${I.swap}</div>
                    <h2>检测到平台域名变化</h2>
                    <button class="btn-icon" id="dm-close">${I.x}</button>
                </div>
                <div class="panel-body">
                    <div style="display:flex;flex-direction:column;gap:4px;padding:10px 12px;background:var(--accent-dim);border-radius:8px;margin-bottom:10px;">
                        <div class="muted-text">旧 URL</div>
                        <div style="font-size:calc(var(--font-size)*0.857);word-break:break-all;color:var(--text);line-height:1.4;">${this._formatUrlWithHostColor(oldUrl, '#f87171')}</div>
                        <div style="font-size:calc(var(--font-size)*0.786);color:var(--muted);margin-top:4px;">新 URL</div>
                        <div style="font-size:calc(var(--font-size)*0.857);word-break:break-all;color:var(--text);line-height:1.4;">${this._formatUrlWithHostColor(newUrl, 'var(--accent)')}</div>
                    </div>
                    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;flex-wrap:wrap;gap:6px;">
                        <div style="font-size:calc(var(--font-size)*0.857);">
                            共 <strong class="accent-text">${matches.length}</strong> 条链接（属于 <strong>${showCount}</strong> 部剧集）将被替换
                        </div>
                        <div style="display:flex;gap:6px;">
                            <button class="btn btn-ghost tag-sm" id="dm-select-all" >全选</button>
                            <button class="btn btn-ghost tag-sm" id="dm-deselect-all" >全不选</button>
                        </div>
                    </div>
                    <div id="dm-list">${listHtml}</div>
                </div>
                <div class="panel-foot">
                    <button class="btn btn-ghost" id="dm-cancel">取消</button>
                    <button class="btn btn-ghost ml-auto" id="dm-platform-only">仅保存平台</button>
                    <button class="btn btn-primary" id="dm-apply">${I.check} 替换选中（<span id="dm-count">${matches.length}</span>）并保存</button>
                </div>
            `;

			const { panel } = this.makeOverlay('domain-migrate', html, { panelClass: ' edit-panel', ariaLabel: '域名迁移确认' });

			const countEl = panel.querySelector('#dm-count');
			const refreshCount = () => { countEl.textContent = selected.size; };
			const checkboxes = panel.querySelectorAll('#dm-list input[type="checkbox"]');
			checkboxes.forEach((cb) => {
				cb.addEventListener('change', () => {
					const idx = parseInt(cb.dataset.idx);
					const link = matches[idx].link;
					if (cb.checked) selected.add(link);
					else selected.delete(link);
					refreshCount();
				});
			});
			panel.querySelector('#dm-select-all').onclick = () => {
				selected.clear();
				matches.forEach(m => selected.add(m.link));
				checkboxes.forEach(cb => cb.checked = true);
				refreshCount();
			};
			panel.querySelector('#dm-deselect-all').onclick = () => {
				selected.clear();
				checkboxes.forEach(cb => cb.checked = false);
				refreshCount();
			};

			const writePlatform = () => {
				if (isNew) state.platforms.push(platformDraft);
				else { const i = state.platforms.findIndex(p => p.id === originalData.id); if (i !== -1) state.platforms[i] = platformDraft; }
				savePlatforms();
				if (mainPanel) this.renderPlatforms(mainPanel);
			};

			const close = () => this.closeOverlay('domain-migrate');
			panel.querySelector('#dm-close').onclick = close;
			panel.querySelector('#dm-cancel').onclick = close;
			panel.querySelector('#dm-platform-only').onclick = () => {
				writePlatform();
				close();
				this.closeOverlay('platform-edit');
				toast(`已更新平台《${platformDraft.name}》（链接未变更）`);
			};
			panel.querySelector('#dm-apply').onclick = () => {
				if (!selected.size) { toast('请至少选择一条链接，或点击"仅保存平台"'); return; }
				const toApply = matches.filter(m => selected.has(m.link));
				const result = applyReplacement(toApply, newParts);
				writePlatform();
				close();
				this.closeOverlay('platform-edit');
				this.renderShows();
				toast(`✅ 已替换 ${result.linkCount} 条链接（${result.showCount} 部剧），并更新平台《${platformDraft.name}》`);
			};
		},

		openDomainBatchReplace() {
			const platformOptions = [...state.platforms]
				.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
				.map(p => `<option value="${escapeHTML(p.id)}">${escapeHTML(p.name)} — ${escapeHTML(getPlatformUrl(p))}</option>`)
				.join('');

			const html = `
                <div class="panel-head">
                    <div class="head-logo">${I.swap}</div>
                    <h2>域名批量替换</h2>
                    <button class="btn-icon" id="dbr-close">${I.x}</button>
                </div>
                <div class="panel-body">
                    <div class="form-group">
                        <label class="form-label">从已有平台预填（可选）</label>
                        <select id="dbr-platform">
                            <option value="">— 自定义（手动输入旧/新 URL） —</option>
                            ${platformOptions}
                        </select>
                    </div>
                    <div class="form-row">
                        <div class="form-group flex-1">
                            <label class="form-label required">旧 URL</label>
                            <input type="text" id="dbr-old" placeholder="www.old.org/">
                        </div>
                        <div class="form-group flex-1">
                            <label class="form-label required">新 URL</label>
                            <input type="text" id="dbr-new" placeholder="www.new.com/">
                        </div>
                    </div>
                    <div class="form-group" id="dbr-sync-wrap" style="display:none;">
                        <label class="cb-row"><input type="checkbox" id="dbr-sync-plat" checked> 同时把所选平台的 URL 更新为「新 URL」</label>
                    </div>
                    <div style="display:flex;align-items:center;justify-content:space-between;margin:6px 0 8px;flex-wrap:wrap;gap:6px;">
                        <div id="dbr-summary" style="font-size:calc(var(--font-size)*0.857);color:var(--muted);">请输入旧/新 URL 以预览匹配的链接</div>
                        <div style="display:flex;gap:6px;">
                            <button class="btn btn-ghost tag-sm" id="dbr-select-all"  disabled>全选</button>
                            <button class="btn btn-ghost tag-sm" id="dbr-deselect-all"  disabled>全不选</button>
                        </div>
                    </div>
                    <div id="dbr-list" style="min-height:80px;"></div>
                </div>
                <div class="panel-foot">
                    <button class="btn btn-ghost" id="dbr-cancel">关闭</button>
                    <button class="btn btn-primary ml-auto" id="dbr-apply" disabled>${I.check} 执行替换（<span id="dbr-count">0</span>）</button>
                </div>
            `;

			const { panel } = this.makeOverlay('domain-batch', html, { panelClass: ' edit-panel', ariaLabel: '域名批量替换' });

			const platSel = panel.querySelector('#dbr-platform');
			const oldInput = panel.querySelector('#dbr-old');
			const newInput = panel.querySelector('#dbr-new');
			const oldProto = createProtocolInput(oldInput, 'https://');
			const newProto = createProtocolInput(newInput, 'https://');
			const syncWrap = panel.querySelector('#dbr-sync-wrap');
			const syncCb = panel.querySelector('#dbr-sync-plat');
			const summary = panel.querySelector('#dbr-summary');
			const listEl = panel.querySelector('#dbr-list');
			const countEl = panel.querySelector('#dbr-count');
			const applyBtn = panel.querySelector('#dbr-apply');
			const selectAllBtn = panel.querySelector('#dbr-select-all');
			const deselectAllBtn = panel.querySelector('#dbr-deselect-all');

			let currentMatches = [];
			let currentNewParts = null;
			let selected = new Set();

			const refreshList = () => {
				const oldVal = oldProto.getValue();
				const newVal = newProto.getValue();
				const oldParts = parseUrlParts(oldVal);
				currentNewParts = parseUrlParts(newVal);

				if (!oldParts) {
					listEl.innerHTML = '';
					currentMatches = []; selected = new Set();
					summary.textContent = '旧 URL 无效，请填写完整URL';
					summary.style.color = oldVal ? '#f87171' : 'var(--muted)';
					applyBtn.disabled = true; countEl.textContent = '0';
					selectAllBtn.disabled = true; deselectAllBtn.disabled = true;
					return;
				}
				if (!currentNewParts) {
					currentMatches = collectLinksByHost(oldParts.hostname);
					listEl.innerHTML = currentMatches.length
						? `<div class="drop-zone">已匹配 ${currentMatches.length} 条链接，请填写有效的新 URL 以预览替换效果</div>`
						: `<div class="drop-zone">未找到包含 hostname「${escapeHTML(oldParts.hostname)}」的播放链接</div>`;
					summary.textContent = currentMatches.length
						? `匹配 ${currentMatches.length} 条链接（${new Set(currentMatches.map(m => m.show.id)).size} 部剧）`
						: '0 条匹配';
					summary.style.color = 'var(--muted)';
					applyBtn.disabled = true; countEl.textContent = '0';
					selectAllBtn.disabled = !currentMatches.length;
					deselectAllBtn.disabled = !currentMatches.length;
					selected = new Set(currentMatches.map(m => m.link));
					return;
				}

				if (oldParts.hostname === currentNewParts.hostname) {
					listEl.innerHTML = `<div style="padding:10px;background:var(--surface);border:1px dashed var(--border);border-radius:8px;color:#f59e0b;font-size:calc(var(--font-size)*0.857);">旧 URL 与新 URL 的 hostname 相同，无需替换</div>`;
					summary.textContent = 'hostname 未变化';
					summary.style.color = '#f59e0b';
					currentMatches = []; selected = new Set();
					applyBtn.disabled = true; countEl.textContent = '0';
					selectAllBtn.disabled = true; deselectAllBtn.disabled = true;
					return;
				}

				currentMatches = collectLinksByHost(oldParts.hostname);
				selected = new Set(currentMatches.map(m => m.link));
				if (!currentMatches.length) {
					listEl.innerHTML = `<div class="drop-zone">未找到包含 hostname「${escapeHTML(oldParts.hostname)}」的播放链接</div>`;
					summary.textContent = '0 条匹配';
					summary.style.color = 'var(--muted)';
					applyBtn.disabled = true; countEl.textContent = '0';
					selectAllBtn.disabled = true; deselectAllBtn.disabled = true;
					return;
				}

				const showCount = new Set(currentMatches.map(m => m.show.id)).size;
				summary.innerHTML = `匹配 <strong class="accent-text">${currentMatches.length}</strong> 条链接（属于 <strong>${showCount}</strong> 部剧集）`;
				summary.style.color = 'var(--text)';
				listEl.innerHTML = this._buildMigrationListHtml(currentMatches, currentNewParts);
				countEl.textContent = currentMatches.length;
				applyBtn.disabled = false;
				selectAllBtn.disabled = false;
				deselectAllBtn.disabled = false;

				listEl.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
					cb.addEventListener('change', () => {
						const idx = parseInt(cb.dataset.idx);
						const link = currentMatches[idx].link;
						if (cb.checked) selected.add(link);
						else selected.delete(link);
						countEl.textContent = selected.size;
					});
				});
			};

			platSel.onchange = () => {
				const pid = platSel.value;
				if (!pid) {
					syncWrap.style.display = 'none';
				} else {
					const pl = state.platforms.find(p => p.id === pid);
					if (pl) {
						oldProto.setValue(getPlatformUrl(pl) || '');
						syncWrap.style.display = 'block';
					}
				}
				refreshList();
			};
			oldInput.addEventListener('input', refreshList);
			newInput.addEventListener('input', refreshList);

			selectAllBtn.onclick = () => {
				selected = new Set(currentMatches.map(m => m.link));
				listEl.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = true);
				countEl.textContent = selected.size;
			};
			deselectAllBtn.onclick = () => {
				selected.clear();
				listEl.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
				countEl.textContent = 0;
			};

			const close = () => this.closeOverlay('domain-batch');
			panel.querySelector('#dbr-close').onclick = close;
			panel.querySelector('#dbr-cancel').onclick = close;
			applyBtn.onclick = () => {
				if (!currentNewParts || !selected.size) { toast('没有可替换的链接'); return; }
				const toApply = currentMatches.filter(m => selected.has(m.link));
				const result = applyReplacement(toApply, currentNewParts);

				// 同步更新平台 URL（如勾选）
				let platName = '';
				if (platSel.value && syncCb.checked) {
					const idx = state.platforms.findIndex(p => p.id === platSel.value);
					if (idx !== -1) {
						state.platforms[idx].url = newProto.getValue();
						platName = state.platforms[idx].name;
						savePlatforms();
						const mainPanel = this.overlays.main?.querySelector('.panel');
						if (mainPanel) this.renderPlatforms(mainPanel);
					}
				}
				close();
				this.renderShows();
				const platMsg = platName ? `，并更新平台《${platName}》` : '';
				toast(`✅ 已替换 ${result.linkCount} 条链接（${result.showCount} 部剧）${platMsg}`);
			};
		},

		// ══════════════════════════════════════════════════
		//  NAVLINKS — 网页导航
		// ══════════════════════════════════════════════════

		/** 渲染搜索引擎下拉框 */
		renderNavEngines(panel) {
			if (!panel) panel = this.overlays.main?.querySelector('.panel');
			if (!panel) return;
			const sel = panel.querySelector('#n-engine');
			if (!sel) return;
			const sorted = [...state.navEngines].sort((a, b) => (a.order || 999) - (b.order || 999));
			sel.innerHTML = sorted.map(e =>
				`<option value="${escapeHTML(e.id)}" ${state.navActiveEngine === e.id ? 'selected' : ''}>${escapeHTML(e.icon)} ${escapeHTML(e.name)}</option>`
			).join('');
			sel.onchange = () => { state.navActiveEngine = sel.value; };
		},

		/** 渲染分类标签栏 */
		renderNavCategories(panel) {
			if (!panel) panel = this.overlays.main?.querySelector('.panel');
			if (!panel) return;
			const bar = panel.querySelector('#n-cat-bar');
			if (!bar) return;
			const allCats = [{ id: 'all', name: '全部', icon: '🔥' }, ...state.navCategories];
			bar.innerHTML = allCats.map(c => {
				const isActive = state.navActiveCategory === c.id;
				const isAll = c.id === 'all';
				const iconHtml = c.icon || '';
				return `<div class="n-cat-tab${isActive ? ' active' : ''}" data-cat-id="${escapeHTML(c.id)}" ${!isAll ? 'draggable="true"' : ''}>
					${iconHtml ? escapeHTML(iconHtml) + ' ' : ''}${escapeHTML(c.name)}
					${!isAll ? `<span class="n-cat-ops">
						<button class="btn-icon" data-act="edit-cat" data-cat-id="${escapeHTML(c.id)}" title="编辑">${I.edit}</button>
					</span>` : ''}
				</div>`;
			}).join('');

			let dragSrcId = null;
			bar.querySelectorAll('.n-cat-tab').forEach(tab => {
				const catId = tab.dataset.catId;
				// 点击切换分类 / 编辑
				tab.addEventListener('click', (e) => {
					if (e.target.closest('[data-act="edit-cat"]')) {
						e.stopPropagation();
						this.openNavCategoryEdit(catId);
						return;
					}
					state.navActiveCategory = catId;
					panel.querySelector('#n-search').value = '';
					this.renderNavCategories(panel);
					this.renderNavLinks(panel);
				});
				// 拖拽排序（"全部" 不参与）
				if (catId === 'all') return;
				tab.addEventListener('dragstart', (e) => {
					dragSrcId = catId;
					e.dataTransfer.effectAllowed = 'move';
					e.dataTransfer.setData('text/plain', catId);
					tab.style.opacity = '0.4';
				});
				tab.addEventListener('dragend', () => { tab.style.opacity = ''; bar.querySelectorAll('.n-cat-tab').forEach(t => t.classList.remove('drag-over')); dragSrcId = null; });
				tab.addEventListener('dragover', (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; tab.classList.add('drag-over'); });
				tab.addEventListener('dragleave', () => { tab.classList.remove('drag-over'); });
				tab.addEventListener('drop', (e) => {
					e.preventDefault(); tab.classList.remove('drag-over');
					if (!dragSrcId || dragSrcId === catId) return;
					const srcIdx = state.navCategories.findIndex(c => c.id === dragSrcId);
					const tgtIdx = state.navCategories.findIndex(c => c.id === catId);
					if (srcIdx === -1 || tgtIdx === -1) return;
					const [moved] = state.navCategories.splice(srcIdx, 1);
					state.navCategories.splice(tgtIdx, 0, moved);
					saveNavCategories();
					this.renderNavCategories(panel);
					this.renderNavLinks(panel);
				});
			});

			// 末尾添加分类按钮
			const existingAdd = bar.querySelector('.n-cat-add-btn');
			if (existingAdd) existingAdd.remove();
			const addBtn = document.createElement('div');
			addBtn.className = 'n-cat-tab n-cat-add-btn';
			addBtn.style.cssText = 'border-style:dashed;color:var(--accent);border-color:var(--accent);padding:8px 8px;display:inline-flex;align-items:center;justify-content:center;';
			addBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="width:14px;height:14px;display:block;"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`;
			addBtn.title = '添加分类';
			addBtn.onclick = () => this.openNavCategoryEdit(null);
			bar.appendChild(addBtn);
		},

		/** 渲染链接卡片 */
		renderNavLinks(panel) {
			if (!panel) panel = this.overlays.main?.querySelector('.panel');
			if (!panel) return;
			const container = panel.querySelector('#n-links-container');
			if (!container) return;
			const search = (panel.querySelector('#n-search')?.value || '').trim().toLowerCase();
			const catId = state.navActiveCategory;

			let links = catId === 'all'
				? [...state.navLinks]
				: state.navLinks.filter(l => (l.categories || []).includes(catId));
			if (search) {
				links = links.filter(l =>
					(l.title || '').toLowerCase().includes(search) ||
					(l.desc || '').toLowerCase().includes(search) ||
					(l.url || '').toLowerCase().includes(search)
				);
			}
			links.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

			container.innerHTML = '';
			if (!links.length) {
				container.innerHTML = `<div class="empty-state">
					<div class="empty-icon">${search ? I.search : I.compass}</div>
					<div class="empty-title">${search ? '没有匹配结果' : '收藏你的常用网站'}</div>
					<div class="empty-sub">${search ? `未找到包含「${escapeHTML(search)}」的网页` : ''}</div>
					${!search ? `<div style="display:flex;flex-direction:column;gap:6px;margin-top:14px;text-align:left;max-width:480px;"><div class="meta-row"><span class="dot-accent"></span>点击左下方「添加网页」手动添加常用网站</div><div class="meta-row"><span class="dot-accent"></span>按 <kbd class="kbd">Shift+D</kbd> 快速打开【网页导航】</div><div class="meta-row"><span class="dot-accent"></span>支持搜索引擎自定义、网页分类管理</div></div>` : ''}
				</div>`;
				this.updateNavFootInfo(panel, links.length);
				return;
			}

			const grid = document.createElement('div');
			grid.className = 'nav-links-grid';
			links.forEach((link, idx) => {
				const card = this.buildNavLinkCard(link, search, idx);
				grid.appendChild(card);
			});
			container.appendChild(grid);
			this.updateNavFootInfo(panel, links.length);
		},

		/** 构建单个导航卡片 */
		buildNavLinkCard(link, search, idx) {
			const card = document.createElement('div');
			card.className = 'nav-link-card';
			card.style.animationDelay = `${(idx || 0) * 20}ms`;
			card.dataset.linkId = link.id;

			let hostname = '';
			try { hostname = new URL(link.url).hostname; } catch { }

			// 图标
			let iconHtml = '';
			if (link.icon) {
				if (/^(https?:|data:)/.test(link.icon)) {
					iconHtml = `<img src="${escapeHTML(link.icon)}" alt="" onerror="this.parentElement.innerHTML='🌐'">`;
				} else if (link.icon.includes('fa-')) {
					iconHtml = `<i class="${escapeHTML(link.icon)} accent-text" ></i>`;
				} else {
					iconHtml = escapeHTML(link.icon);
				}
			} else if (hostname) {
				iconHtml = `<img src="https://favicon.im/zh/${hostname}" alt="" loading="lazy" onerror="this.parentElement.innerHTML='🌐'">`;
			} else {
				iconHtml = '🌐';
			}

			// 分类标签
			const catTags = (link.categories || []).map(cid => {
				const cat = state.navCategories.find(c => c.id === cid);
				return cat ? `<span class="nav-link-cat-tag">${escapeHTML(cat.icon || '')}${escapeHTML(cat.name)}</span>` : '';
			}).join('');

			card.innerHTML = `
				<div class="card-hover-ops">
					<button class="btn-icon accent-text" data-act="edit-link" title="编辑" >${I.edit}</button>
					<button class="btn-icon" data-act="del-link" title="删除" style="color:#f87171;">${I.trash}</button>
				</div>
				<div style="display:flex;align-items:flex-start;gap:8px;">
					<div class="nav-link-icon">${iconHtml}</div>
					<div style="flex:1;min-width:0;">
						<div class="nav-link-title" data-tip="${escapeHTML(link.title)}">${highlightText(link.title, search)}</div>
						<div class="nav-link-desc">${escapeHTML(link.desc || '暂无描述')}</div>
						<div class="nav-link-cats">${catTags}</div>
					</div>
				</div>
			`;

			// 点击操作
			card.addEventListener('click', (e) => {
				const actBtn = e.target.closest('[data-act]');
				if (actBtn) {
					e.stopPropagation();
					const act = actBtn.dataset.act;
					if (act === 'edit-link') this.openNavLinkEdit(link.id);
					if (act === 'del-link') this.deleteNavLink(link.id);
					return;
				}
				if (link.url) window.open(link.url, '_blank', 'noopener,noreferrer');
			});

			return card;
		},

		/** 更新底部信息 */
		updateNavFootInfo(panel, count) {
			if (!panel) panel = this.overlays.main?.querySelector('.panel');
			if (!panel) return;
			const el = panel.querySelector('#m-foot-info');
			if (el) el.textContent = `${count} 个网页`;
		},

		/** 删除导航链接 */
		deleteNavLink(linkId) {
			const link = state.navLinks.find(l => l.id === linkId);
			if (!link) return;
			const idx = state.navLinks.findIndex(l => l.id === linkId);
			const delLink = state.navLinks[idx];
			state.navLinks.splice(idx, 1);
			saveNavLinks();
			const mainPanel = this.overlays.main?.querySelector('.panel');
			if (mainPanel) this.renderNavLinks(mainPanel);
			showUndoToast(`已删除「${delLink.title}」`, () => {
				state.navLinks.splice(idx, 0, delLink);
				saveNavLinks();
				if (mainPanel) this.renderNavLinks(mainPanel);
				toast(`已撤销：「${delLink.title}」已恢复`);
			});
		},

		/** 打开分类编辑弹窗 */
		openNavCategoryEdit(catId) {
			const isNew = !catId;
			const data = catId ? state.navCategories.find(c => c.id === catId) : { id: '', name: '', icon: '' };
			if (catId && !data) return;

			const { ov, panel } = this.makeOverlay('nav-cat-edit', `
				<div class="panel-head">
					<div class="head-logo">${isNew ? I.plus : I.edit}</div>
					<h2>${isNew ? '添加分类' : '编辑分类'}</h2>
					<button class="btn-icon" id="nce-close">${I.x}</button>
				</div>
				<div class="panel-body">
					<div class="form-group">
						<label class="form-label required">分类名称</label>
						<input type="text" id="nce-name" value="${escapeHTML(data.name || '')}" maxlength="20" placeholder="如：常用">
					</div>
					<div class="form-group">
						<label class="form-label">图标（Emoji 或 FontAwesome class）</label>
						<input type="text" id="nce-icon" value="${escapeHTML(data.icon || '')}" maxlength="60" placeholder="⭐ 输入 Emoji 图标，留空默认 📁">
						<div style="display:flex;gap:3px;flex-wrap:wrap;margin-top:6px;" id="nce-emoji-presets"></div>
					</div>
				</div>
				<div class="panel-foot">
					${!isNew ? `<button class="btn btn-danger" id="nce-delete">${I.trash} 删除分类</button>` : ''}
					<button class="btn btn-ghost ml-auto" id="nce-cancel">取消</button>
					<button class="btn btn-primary" id="nce-save">${I.check} 保存</button>
				</div>
			`, { panelClass: ' edit-panel', initialFocus: '#nce-name' });

			// emoji 预设
			const presetsEl = panel.querySelector('#nce-emoji-presets');
			NAV_EMOJI_PRESETS.forEach(emoji => {
				const btn = document.createElement('button');
				btn.className = 'n-emoji-preset';
				btn.textContent = emoji;
				btn.onclick = () => { panel.querySelector('#nce-icon').value = emoji; };
				presetsEl.appendChild(btn);
			});

			const close = () => this.closeOverlay('nav-cat-edit');
			panel.querySelector('#nce-close').onclick = close;
			panel.querySelector('#nce-cancel').onclick = close;

			if (!isNew) {
				panel.querySelector('#nce-delete').onclick = () => {
					if (!confirm(`确定删除分类「${data.name}」？该分类下的链接不会被删除，但会解除关联。`)) return;
					state.navCategories = state.navCategories.filter(c => c.id !== catId);
					state.navLinks.forEach(l => { l.categories = (l.categories || []).filter(cid => cid !== catId); });
					if (state.navActiveCategory === catId) state.navActiveCategory = 'all';
					saveNavCategories(); saveNavLinks();
					close();
					const mainPanel = this.overlays.main?.querySelector('.panel');
					if (mainPanel) { this.renderNavCategories(mainPanel); this.renderNavLinks(mainPanel); }
					toast('分类已删除');
				};
			}

			panel.querySelector('#nce-save').onclick = () => {
				const name = panel.querySelector('#nce-name').value.trim();
				const icon = panel.querySelector('#nce-icon').value.trim();
				if (!name) { toast('分类名称不能为空'); return; }
				const dup = state.navCategories.find(c => c.name.toLowerCase() === name.toLowerCase() && c.id !== catId);
				if (dup) { toast('已存在同名分类，请使用不同名称'); return; }
				if (isNew) {
					state.navCategories.push({ id: 'nc_' + Date.now() + '_' + Math.random().toString(36).slice(2, 5), name, icon: icon || '📁' });
				} else {
					data.name = name;
					if (icon) data.icon = icon;
				}
				saveNavCategories();
				close();
				const mainPanel = this.overlays.main?.querySelector('.panel');
				if (mainPanel) { this.renderNavCategories(mainPanel); this.renderNavLinks(mainPanel); }
				toast(`分类已${isNew ? '添加' : '更新'}`);
			};
		},

		/** 构建链接编辑表单 HTML */
		buildNavLinkEditHTML(data, isNew) {
			const catCheckboxes = state.navCategories.map(c =>
				`<label style="display:flex;align-items:center;gap:5px;padding:3px 5px;border-radius:6px;cursor:pointer;font-size:calc(var(--font-size)*0.857);color:var(--text);user-select:none;">
					<input type="checkbox" value="${escapeHTML(c.id)}" ${data.categories.includes(c.id) ? 'checked' : ''} style="accent-color:var(--accent);">
					${escapeHTML(c.icon || '')}${escapeHTML(c.name)}
				</label>`
			).join('');
			return `
				<div class="panel-head">
					<div class="head-logo">${isNew ? I.plus : I.edit}</div>
					<h2>${isNew ? '添加网页' : '编辑网页'}</h2>
					<button class="btn-icon" id="nle-close">${I.x}</button>
				</div>
				<div class="panel-body">
					<div class="form-group">
						<label class="form-label required">网站标题</label>
						<div class="inline-row">
							<input type="text" id="nle-title" value="${escapeHTML(data.title || '')}" maxlength="50" placeholder="网站名称" class="flex-1">
							<button class="btn-icon" id="nle-grab-page" title="从当前页面自动抓取标题和网址" style="flex-shrink:0;">${I.zap}</button>
						</div>
					</div>
					<div class="form-group">
						<label class="form-label required">URL</label>
						<input type="text" id="nle-url" value="${escapeHTML(data.url || '')}" placeholder="www.example.com/">
					</div>
					<div class="form-group">
						<label class="form-label">简短描述</label>
						<input type="text" id="nle-desc" value="${escapeHTML(data.desc || '')}" maxlength="100" placeholder="一句话介绍">
					</div>
					<div class="form-group">
						<label class="form-label">图标 <span style="color:var(--muted);font-weight:400;">（Emoji / 文字 / 图片URL，留空自动获取）</span></label>
						<div class="inline-row">
							<input type="text" id="nle-icon" value="${escapeHTML(data.icon || '')}" maxlength="200" placeholder="留空自动获取 favicon" class="flex-1">
							<button class="btn btn-ghost" id="nle-preview-fav" title="预览图标源">${I.eye} 预览</button>
						</div>
						<div style="display:flex;gap:3px;flex-wrap:wrap;margin-top:6px;" id="nle-emoji-presets"></div>
						<div id="nle-fav-thumbs" class="nav-link-fav-row"></div>
					</div>
					<div class="form-group">
						<label class="form-label required">所属分类</label>
						<div style="display:grid;grid-template-columns:1fr 1fr;gap:2px;max-height:120px;overflow-y:auto;" id="nle-cats">${catCheckboxes}</div>
						<p class="muted-sm" style="margin-top:4px;">可选择多个分类</p>
					</div>
				</div>
				<div class="panel-foot">
					${!isNew ? `<button class="btn btn-danger" id="nle-delete">${I.trash} 删除</button>` : ''}
					<button class="btn btn-ghost ml-auto" id="nle-cancel">取消</button>
					<button class="btn btn-primary" id="nle-save">${I.check} 保存</button>
				</div>`;
		},

		/** 绑定链接编辑表单事件 */
		bindNavLinkEditEvents(panel, data, isNew, linkId) {
			// emoji 预设
			const presetsEl = panel.querySelector('#nle-emoji-presets');
			NAV_EMOJI_PRESETS.forEach(emoji => {
				const btn = document.createElement('button');
				btn.className = 'n-emoji-preset';
				btn.textContent = emoji;
				btn.onclick = () => { panel.querySelector('#nle-icon').value = emoji; };
				presetsEl.appendChild(btn);
			});

			// URL 协议切换输入组件
			const urlInputEl = panel.querySelector('#nle-url');
			const navUrlProto = createProtocolInput(urlInputEl, 'https://');

			// 从当前页面抓取标题和网址
			const grabPageBtn = panel.querySelector('#nle-grab-page');
			if (grabPageBtn) {
				grabPageBtn.onclick = () => {
					let pageTitle = document.title || '';
					const pageUrl = window.location.href || '';
					const suffixes = [' - 哔哩哔哩', '_腾讯视频', '- 优酷', '- 爱奇艺', ' - YouTube', ' - Netflix', ' - Apple TV+', ' | ', ' – '];
					for (const s of suffixes) { pageTitle = pageTitle.split(s)[0]; }
					pageTitle = pageTitle.trim();
					if (pageTitle) panel.querySelector('#nle-title').value = pageTitle;
					if (pageUrl && /^https?:\/\//i.test(pageUrl)) navUrlProto.setValue(pageUrl);
					if (pageTitle || pageUrl) toast('已从当前页面抓取信息');
					else toast('未能获取页面信息');
				};
			}

			// favicon 预览
			panel.querySelector('#nle-preview-fav').onclick = () => {
				const url = navUrlProto.getValue().trim();
				if (!url || !/^https?:\/\//i.test(url)) { toast('请先填写有效的 URL'); return; }
				const services = getFaviconServices(url);
				const thumbsEl = panel.querySelector('#nle-fav-thumbs');
				thumbsEl.innerHTML = '';
				services.forEach((srv, i) => {
					const wrap = document.createElement('div');
					wrap.className = 'nav-link-fav-thumb';
					wrap.title = `图标源 ${i + 1}`;
					const img = document.createElement('img');
					img.src = srv; img.alt = ''; img.loading = 'lazy';
					img.onerror = () => { wrap.style.display = 'none'; };
					wrap.appendChild(img);
					wrap.addEventListener('click', () => {
						thumbsEl.querySelectorAll('.nav-link-fav-thumb').forEach(t => t.classList.remove('selected'));
						wrap.classList.add('selected');
						panel.querySelector('#nle-icon').value = srv;
					});
					thumbsEl.appendChild(wrap);
				});
				setTimeout(() => {
					const thumbs = thumbsEl.querySelectorAll('.nav-link-fav-thumb');
					for (const t of thumbs) {
						const img = t.querySelector('img');
						if (img && img.naturalWidth > 0) {
							thumbs.forEach(tt => tt.classList.remove('selected'));
							t.classList.add('selected');
							const iconInput = panel.querySelector('#nle-icon');
							if (!iconInput.value) iconInput.value = t.querySelector('img').src;
							break;
						}
					}
				}, 1500);
			};

			const close = () => this.closeOverlay('nav-link-edit');
			panel.querySelector('#nle-close').onclick = close;
			panel.querySelector('#nle-cancel').onclick = close;

			if (!isNew) {
				panel.querySelector('#nle-delete').onclick = () => {
					if (!confirm(`确定删除「${data.title}」？`)) return;
					state.navLinks = state.navLinks.filter(l => l.id !== linkId);
					saveNavLinks();
					close();
					const mainPanel = this.overlays.main?.querySelector('.panel');
					if (mainPanel) this.renderNavLinks(mainPanel);
					toast('链接已删除');
				};
			}

			panel.querySelector('#nle-save').onclick = () => {
				const title = panel.querySelector('#nle-title').value.trim();
				const url = navUrlProto.getValue().trim();
				const desc = panel.querySelector('#nle-desc').value.trim();
				const icon = panel.querySelector('#nle-icon').value.trim();
				if (!title) { toast('标题不能为空'); return; }
				if (!url) { toast('URL不能为空'); return; }
				try { new URL(url); } catch { toast('请输入有效的URL'); return; }
				const checkedCats = Array.from(panel.querySelectorAll('#nle-cats input[type=checkbox]:checked')).map(cb => cb.value);
				if (!checkedCats.length) { toast('请至少选择一个分类'); return; }

				if (isNew) {
					const maxOrder = Math.max(-1, ...state.navLinks.map(l => l.order ?? 0));
					state.navLinks.push({
						id: 'nl_' + Date.now() + '_' + Math.random().toString(36).slice(2, 5),
						title, url, desc, icon, categories: checkedCats, order: maxOrder + 1,
					});
					toast(`已添加「${title}」`);
				} else {
					const existing = state.navLinks.find(l => l.id === linkId);
					if (existing) {
						existing.title = title; existing.url = url; existing.desc = desc;
						existing.icon = icon; existing.categories = checkedCats;
						toast(`已更新「${title}」`);
					}
				}
				saveNavLinks();
				close();
				const mainPanel = this.overlays.main?.querySelector('.panel');
				if (mainPanel) this.renderNavLinks(mainPanel);
			};
		},

		/** 打开链接编辑弹窗 */
		openNavLinkEdit(linkId, preSelectedCatId) {
			const isNew = !linkId;
			const data = linkId
				? JSON.parse(JSON.stringify(state.navLinks.find(l => l.id === linkId) || {}))
				: { id: '', title: '', url: '', desc: '', icon: '', categories: [] };
			if (linkId && !data.id) return;
			if (preSelectedCatId && !data.categories.length) data.categories = [preSelectedCatId];
			else if (!isNew && !data.categories.length && state.navActiveCategory !== 'all') data.categories = [state.navActiveCategory];
			const html = this.buildNavLinkEditHTML(data, isNew);
			const { ov, panel } = this.makeOverlay('nav-link-edit', html, { panelClass: ' edit-panel', initialFocus: '#nle-title' });
			this.bindNavLinkEditEvents(panel, data, isNew, linkId);
		},

		/** 打开搜索引擎列表管理 */
		openNavEngineList() {
			const { ov, panel } = this.makeOverlay('nav-engine-list', `
				<div class="panel-head">
					<div class="head-logo">${I.gear}</div>
					<h2>搜索引擎管理</h2>
					<button class="btn-icon" id="nel-close">${I.x}</button>
				</div>
				<div class="panel-body">
					<div id="nel-list"></div>
					<button class="btn btn-ghost" id="nel-add" style="width:100%;justify-content:center;margin-top:8px;border-style:dashed;border-color:var(--accent);color:var(--accent);">${I.plus} 添加搜索引擎</button>
				</div>
				<div class="panel-foot">
					<button class="btn btn-ghost ml-auto" id="nel-done">完成</button>
				</div>
			`, { panelClass: ' edit-panel' });

			let dragSrcId = null;
			const renderList = () => {
				const listEl = panel.querySelector('#nel-list');
				const sorted = [...state.navEngines].sort((a, b) => (a.order || 999) - (b.order || 999));
				listEl.innerHTML = sorted.map(e => `
					<div class="nav-engine-row" data-id="${escapeHTML(e.id)}" draggable="true">
						<span style="cursor:grab;color:var(--muted);font-size:0.85em;" title="拖拽排序">≡</span>
						<span style="font-size:1.1em;width:24px;text-align:center;">${escapeHTML(e.icon)}</span>
						<span style="flex:1;font-weight:500;font-size:calc(var(--font-size)*0.857);color:var(--text);">${escapeHTML(e.name)}</span>
						<button class="btn-icon" data-act="edit-engine" data-engine-id="${escapeHTML(e.id)}" title="编辑" style="border:none;box-shadow:none;">${I.edit}</button>
						<button class="btn-icon" data-act="del-engine" data-engine-id="${escapeHTML(e.id)}" title="删除" style="border:none;box-shadow:none;color:#f87171;">${I.trash}</button>
					</div>
				`).join('');

				listEl.querySelectorAll('[data-act="edit-engine"]').forEach(btn => {
					btn.onclick = () => { this.openNavEngineEdit(btn.dataset.engineId); };
				});
				listEl.querySelectorAll('[data-act="del-engine"]').forEach(btn => {
					btn.onclick = () => {
						const eid = btn.dataset.engineId;
						if (state.navEngines.length <= 1) { toast('至少保留一个搜索引擎'); return; }
						const eng = state.navEngines.find(e => e.id === eid);
						if (!eng) return;
						if (!confirm(`确定删除搜索引擎「${eng.name}」？`)) return;
						state.navEngines = state.navEngines.filter(e => e.id !== eid);
						if (state.navActiveEngine === eid) state.navActiveEngine = state.navEngines[0]?.id || '';
						saveNavEngines();
						renderList();
						const mainPanel = this.overlays.main?.querySelector('.panel');
						if (mainPanel) this.renderNavEngines(mainPanel);
						toast('搜索引擎已删除');
					};
				});

				// 拖拽排序
				listEl.querySelectorAll('.nav-engine-row').forEach(row => {
					row.addEventListener('dragstart', (e) => {
						dragSrcId = row.dataset.id;
						e.dataTransfer.effectAllowed = 'move';
						row.style.opacity = '0.4';
					});
					row.addEventListener('dragend', () => { row.style.opacity = ''; listEl.querySelectorAll('.nav-engine-row').forEach(r => r.classList.remove('drag-over')); dragSrcId = null; });
					row.addEventListener('dragover', (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; row.classList.add('drag-over'); });
					row.addEventListener('dragleave', () => { row.classList.remove('drag-over'); });
					row.addEventListener('drop', (e) => {
						e.preventDefault(); row.classList.remove('drag-over');
						if (!dragSrcId || dragSrcId === row.dataset.id) return;
						const srcIdx = state.navEngines.findIndex(x => x.id === dragSrcId);
						const tgtIdx = state.navEngines.findIndex(x => x.id === row.dataset.id);
						if (srcIdx === -1 || tgtIdx === -1) return;
						const [moved] = state.navEngines.splice(srcIdx, 1);
						state.navEngines.splice(tgtIdx, 0, moved);
						state.navEngines.forEach((eng, i) => eng.order = i + 1);
						saveNavEngines();
						renderList();
						const mainPanel = this.overlays.main?.querySelector('.panel');
						if (mainPanel) this.renderNavEngines(mainPanel);
					});
				});
			};

			renderList();
			panel.querySelector('#nel-add').onclick = () => this.openNavEngineEdit(null);
			const close = () => this.closeOverlay('nav-engine-list');
			panel.querySelector('#nel-close').onclick = close;
			panel.querySelector('#nel-done').onclick = close;
		},

		/** 打开搜索引擎编辑弹窗 */
		openNavEngineEdit(engineId) {
			const isNew = !engineId;
			const data = engineId ? state.navEngines.find(e => e.id === engineId) : { id: '', name: '', icon: '', url: '', isDefault: false };
			if (engineId && !data) return;

			const TEMPLATE_ENGINES = [
				{ name: '搜狗', url: 'https://www.sogou.com/web?query={q}' },
				{ name: '360', url: 'https://so.com/s?q={q}' },
				{ name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q={q}' },
				{ name: 'GitHub', url: 'https://github.com/search?q={q}&type=repositories' },
			];

			const { ov, panel } = this.makeOverlay('nav-engine-edit', `
				<div class="panel-head">
					<div class="head-logo">${isNew ? I.plus : I.edit}</div>
					<h2>${isNew ? '添加搜索引擎' : '编辑搜索引擎'}</h2>
					<button class="btn-icon" id="nee-close">${I.x}</button>
				</div>
				<div class="panel-body">
					<div class="form-group">
						<label class="form-label required">引擎名称</label>
						<input type="text" id="nee-name" value="${escapeHTML(data.name || '')}" maxlength="30" placeholder="如：搜狗搜索">
					</div>
					<div class="form-group">
						<label class="form-label">图标（仅 Emoji）</label>
						<input type="text" id="nee-icon" value="${escapeHTML(data.icon || '')}" maxlength="8" placeholder="🔍">
						<div style="display:flex;gap:3px;flex-wrap:wrap;margin-top:6px;" id="nee-emoji-presets"></div>
					</div>
					<div class="form-group">
						<label class="form-label required">搜索 URL 模板</label>
						<input type="text" id="nee-url" value="${escapeHTML(data.url || '')}" placeholder="https://example.com/search?q={q}">
						<p style="font-size:calc(var(--font-size)*0.714);color:var(--muted);margin-top:3px;">必须包含 <code style="background:var(--surface-hi);padding:1px 4px;border-radius:3px;">{q}</code> 作为关键词占位符</p>
					</div>
					<details class="muted-text">
						<summary style="cursor:pointer;font-weight:600;">常用引擎模板（点击快速填入）</summary>
						<div style="margin-top:6px;padding-left:10px;border-left:2px solid var(--border);font-family:monospace;font-size:0.85em;">
							${TEMPLATE_ENGINES.map(t => `<p style="cursor:pointer;padding:2px 0;" data-tpl-url="${escapeHTML(t.url)}">${escapeHTML(t.url)} <span style="font-family:inherit;color:var(--muted);">${t.name}</span></p>`).join('')}
						</div>
					</details>
				</div>
				<div class="panel-foot">
					${!isNew ? `<button class="btn btn-danger" id="nee-delete">${I.trash} 删除引擎</button>` : ''}
					<button class="btn btn-ghost ml-auto" id="nee-cancel">取消</button>
					<button class="btn btn-primary" id="nee-save">${I.check} 保存</button>
				</div>
			`, { panelClass: ' edit-panel', initialFocus: '#nee-name' });

			// emoji 预设
			const presetsEl = panel.querySelector('#nee-emoji-presets');
			NAV_EMOJI_PRESETS.slice(0, 10).forEach(emoji => {
				const btn = document.createElement('button');
				btn.className = 'n-emoji-preset';
				btn.textContent = emoji;
				btn.onclick = () => { panel.querySelector('#nee-icon').value = emoji; };
				presetsEl.appendChild(btn);
			});

			// 模板点击
			panel.querySelectorAll('[data-tpl-url]').forEach(el => {
				el.onclick = () => { panel.querySelector('#nee-url').value = el.dataset.tplUrl; };
			});

			const close = () => this.closeOverlay('nav-engine-edit');
			panel.querySelector('#nee-close').onclick = close;
			panel.querySelector('#nee-cancel').onclick = close;

			if (!isNew && panel.querySelector('#nee-delete')) {
				panel.querySelector('#nee-delete').onclick = () => {
					if (state.navEngines.length <= 1) { toast('至少保留一个搜索引擎'); return; }
					if (!confirm(`确定删除搜索引擎「${data.name}」？`)) return;
					state.navEngines = state.navEngines.filter(e => e.id !== engineId);
					if (state.navActiveEngine === engineId && state.navEngines.length) state.navActiveEngine = state.navEngines[0].id;
					saveNavEngines();
					close();
					this.closeOverlay('nav-engine-list');
					const mainPanel = this.overlays.main?.querySelector('.panel');
					if (mainPanel) this.renderNavEngines(mainPanel);
					toast('搜索引擎已删除');
				};
			}

			panel.querySelector('#nee-save').onclick = () => {
				const name = panel.querySelector('#nee-name').value.trim();
				let icon = panel.querySelector('#nee-icon').value.trim();
				let url = panel.querySelector('#nee-url').value.trim();
				if (!name) { toast('引擎名称不能为空'); return; }
				if (!url) { toast('搜索URL不能为空'); return; }
				if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
				if (!url.includes('{q}')) { toast('URL必须包含 {q} 占位符'); return; }
				try { new URL(url.replace('{q}', 'TEST')); } catch { toast('URL格式无效'); return; }
				if (icon.includes('fa-')) { toast('引擎图标只支持 Emoji'); return; }

				if (isNew) {
					if (state.navEngines.length >= MAX_NAV_CUSTOM_ENGINES) { toast(`最多添加 ${MAX_NAV_CUSTOM_ENGINES} 个搜索引擎`); return; }
					const maxOrder = Math.max(0, ...state.navEngines.map(e => e.order || 0));
					state.navEngines.push({
						id: 'ne_' + Date.now() + '_' + Math.random().toString(36).slice(2, 5),
						name, icon: icon || '🔍', url, isDefault: false, order: maxOrder + 1,
					});
				} else {
					data.name = name; data.url = url;
					if (icon) data.icon = icon;
				}
				saveNavEngines();
				close();
				this.closeOverlay('nav-engine-list');
				const mainPanel = this.overlays.main?.querySelector('.panel');
				if (mainPanel) this.renderNavEngines(mainPanel);
				toast(`搜索引擎已${isNew ? '添加' : '更新'}`);
			};
		},

		// ══════════════════════════════════════════════════
		//  NOTES — 笔记模块
		// ══════════════════════════════════════════════════

		_currentNoteId: null,

		/** 渲染笔记列表 */
		renderNotesList(panel) {
			if (!panel) panel = this.overlays.main?.querySelector('.panel');
			if (!panel) return;
			const listEl = panel.querySelector('#nt-list');
			if (!listEl) return;
			const search = (panel.querySelector('#nt-search')?.value || '').trim().toLowerCase();
			let notes = [...state.notes];
			if (search) notes = notes.filter(n => (n.title || '').toLowerCase().includes(search) || (n.content || '').toLowerCase().includes(search));
			// 排序：置顶优先，然后按 updatedAt 降序
			notes.sort((a, b) => {
				if (a.pinned && !b.pinned) return -1;
				if (!a.pinned && b.pinned) return 1;
				return (b.updatedAt || 0) - (a.updatedAt || 0);
			});
			listEl.innerHTML = '';
			if (!notes.length) {
				listEl.innerHTML = `<div style="text-align:center;padding:20px;color:var(--muted);font-size:calc(var(--font-size)*0.786);">${search ? '没有匹配的笔记' : '暂无笔记，点击 + 新建'}</div>`;
				return;
			}
			notes.forEach(note => {
				const card = document.createElement('div');
				card.className = 'note-card' + (note.id === this._currentNoteId ? ' active' : '');
				card.dataset.noteId = note.id;
				const preview = (note.content || '').replace(/[#*`>\-\[\]!~_]/g, '').trim().slice(0, 60);
				const dateStr = new Date(note.updatedAt).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
				card.innerHTML = `
					<div class="note-card-ops">
						<button class="btn-icon ${note.pinned ? 'active' : ''}" data-act="pin-note" title="${note.pinned ? '取消置顶' : '置顶'}">${I.pin}</button>
						<button class="btn-icon" data-act="export-note" title="导出为 .md">${I.upload}</button>
						<button class="btn-icon" data-act="del-note" title="删除" style="color:#f87171;">${I.trash}</button>
					</div>
					<div class="note-card-title">${escapeHTML(note.title || '无标题')}</div>
					<div class="note-card-preview">${escapeHTML(preview || '空笔记')}</div>
					<div class="note-card-date">${note.pinned ? '📌 ' : ''}${dateStr}</div>
				`;
				// 点击操作
				card.addEventListener('click', (e) => {
					const actBtn = e.target.closest('[data-act]');
					if (actBtn) {
						e.stopPropagation();
						const act = actBtn.dataset.act;
						if (act === 'pin-note') { note.pinned = !note.pinned; note.updatedAt = Date.now(); saveNotes(); this.renderNotesList(panel); }
						if (act === 'export-note') this.exportNoteAsMd(note);
						if (act === 'del-note') this.deleteNote(note.id, panel);
						return;
					}
					this.openNote(note.id, panel);
				});
				listEl.appendChild(card);
			});
		},

		/** 新建笔记 */
		createNote(panel) {
			const note = { id: 'nt_' + Date.now() + '_' + Math.random().toString(36).slice(2, 5), title: '新建笔记', content: '', pinned: false, createdAt: Date.now(), updatedAt: Date.now() };
			state.notes.unshift(note);
			saveNotes();
			this._currentNoteId = note.id;
			this.renderNotesList(panel);
			this.openNote(note.id, panel, true);
			const footInfo = panel?.querySelector('#m-foot-info');
			if (footInfo) footInfo.textContent = `${state.notes.length} 篇笔记`;
		},

		/** 打开笔记（默认只读模式） */
		openNote(noteId, panel, startEdit = false) {
			if (!panel) panel = this.overlays.main?.querySelector('.panel');
			if (!panel) return;
			const note = state.notes.find(n => n.id === noteId);
			if (!note) return;
			this._currentNoteId = noteId;
			panel.querySelectorAll('.note-card').forEach(c => c.classList.toggle('active', c.dataset.noteId === noteId));

			const editorEl = panel.querySelector('#nt-editor');
			if (!editorEl) return;
			let isEditing = startEdit;
			const autoSave = debounce(() => { note.updatedAt = Date.now(); saveNotes(); this.renderNotesList(panel); }, 1000);

			const renderView = () => {
				if (isEditing) {
					// 编辑模式：textarea + 格式工具栏
					editorEl.innerHTML = `
						<div class="notes-editor-head">
							<input type="text" id="nt-title" value="${escapeHTML(note.title || '')}" placeholder="笔记标题">
						</div>
						<div class="notes-toolbar">
							<button class="btn-icon" data-tb="bold" title="加粗"><strong>B</strong></button>
							<button class="btn-icon" data-tb="italic" title="斜体"><em>I</em></button>
							<div class="tb-sep"></div>
							<button class="btn-icon" data-tb="h1" title="H1"><span class="tb-label">H1</span></button>
							<button class="btn-icon" data-tb="h2" title="H2"><span class="tb-label">H2</span></button>
							<button class="btn-icon" data-tb="h3" title="H3"><span class="tb-label">H3</span></button>
							<div class="tb-sep"></div>
							<button class="btn-icon" data-tb="code" title="行内代码">${I.zap}</button>
							<button class="btn-icon" data-tb="codeblock" title="代码块" style="font-size:0.7em;font-weight:700;">{ }</button>
							<button class="btn-icon" data-tb="link" title="链接">${I.extLink}</button>
							<button class="btn-icon" data-tb="list" title="无序列表">${I.rows}</button>
							<button class="btn-icon" data-tb="tasklist" title="任务列表" style="font-size:0.75em;font-weight:700;">☑</button>
							<button class="btn-icon" data-tb="table" title="插入表格" style="font-size:0.7em;font-weight:700;">⊞</button>
							<button class="btn-icon" data-tb="quote" title="引用">"</button>
							<button class="btn-icon" data-tb="hr" title="分隔线">—</button>
							<div style="margin-left:auto"></div>
							<button class="btn btn-ghost" data-tb="done" title="完成编辑" style="color:var(--accent);border-color:var(--accent);padding:3px 10px;font-size:calc(var(--font-size)*0.786);">${I.check} 完成</button>
						</div>
						<div class="notes-edit-area">
							<textarea class="notes-textarea" id="nt-content">${escapeHTML(note.content || '')}</textarea>
						</div>
					`;
					const titleInput = editorEl.querySelector('#nt-title');
					if (titleInput) titleInput.oninput = () => { note.title = titleInput.value; autoSave(); };
					const textarea = editorEl.querySelector('#nt-content');
					if (textarea) {
						textarea.oninput = () => { note.content = textarea.value; autoSave(); };
						textarea.onkeydown = (e) => { if (e.key === 'Tab') { e.preventDefault(); const s = textarea.selectionStart, en = textarea.selectionEnd; textarea.value = textarea.value.slice(0, s) + '    ' + textarea.value.slice(en); textarea.selectionStart = textarea.selectionEnd = s + 4; note.content = textarea.value; autoSave(); } };
						textarea.focus();
					}
					editorEl.querySelectorAll('[data-tb]').forEach(btn => {
						btn.onclick = () => {
							const action = btn.dataset.tb;
							if (action === 'done') { isEditing = false; renderView(); }
							else if (textarea) this._insertMdSyntax(textarea, action, note, autoSave);
						};
					});
				} else {
					// 只读模式：渲染后的 Markdown + 编辑按钮
					editorEl.innerHTML = `
						<div class="notes-editor-head">
							<div style="font-size:calc(var(--font-size)*1.0);font-weight:600;color:var(--text);padding:2px 0;">${escapeHTML(note.title || '无标题')}</div>
						</div>
						<div class="notes-toolbar">
							<button class="btn btn-ghost accent-btn" data-tb="edit" title="编辑笔记" style="padding:3px 10px;font-size:calc(var(--font-size)*0.786);">${I.edit} 编辑</button>
							<button class="btn-icon" data-tb="import-md" title="导入 .md 文件">${I.download}</button>
							<div style="margin-left:auto"></div>
							<button class="btn-icon" data-tb="props" title="笔记属性">${I.help}</button>
						</div>
						<div class="notes-edit-area">
							<div class="notes-preview" id="nt-preview">${parseMarkdown(note.content || '')}</div>
						</div>
					`;
					editorEl.querySelectorAll('[data-tb]').forEach(btn => {
						btn.onclick = () => {
							const action = btn.dataset.tb;
							if (action === 'edit') { isEditing = true; renderView(); }
							else if (action === 'import-md') this.importNoteFromMd(panel);
							else if (action === 'props') this.openNoteProps(note, panel);
						};
					});
				}
			};
			renderView();
		},

		/** 笔记属性面板 */
		openNoteProps(note, panel) {
			const charCount = (note.content || '').replace(/\s/g, '').length;
			const createdStr = new Date(note.createdAt).toLocaleString('zh-CN');
			const updatedStr = new Date(note.updatedAt).toLocaleString('zh-CN');
			// 提取 TOC
			const tocItems = [];
			(note.content || '').split('\n').forEach((line, i) => {
				const m = line.match(/^(#{1,3})\s+(.+)/);
				if (m) tocItems.push({ level: m[1].length, text: m[2], line: i });
			});
			const tocHtml = tocItems.length
				? tocItems.map(t => `<div style="padding-left:${(t.level - 1) * 14}px;padding:2px 0 2px ${(t.level - 1) * 14}px;font-size:calc(var(--font-size)*0.786);cursor:pointer;color:var(--text);transition:color 0.15s;" data-toc-line="${t.line}" class="toc-item">${escapeHTML(t.text)}</div>`).join('')
				: '<div class="muted-text">无标题，无法生成目录</div>';

			const { ov, panel: propsPanel } = this.makeOverlay('note-props', `
				<div class="panel-head">
					<div class="head-logo">${I.help}</div>
					<h2>笔记属性</h2>
					<button class="btn-icon" id="np-close">${I.x}</button>
				</div>
				<div class="panel-body" style="padding:14px 18px;">
					<div style="display:flex;flex-direction:column;gap:8px;font-size:calc(var(--font-size)*0.857);">
						<div><span style="color:var(--muted);">创建时间：</span>${createdStr}</div>
						<div><span style="color:var(--muted);">最后修改：</span>${updatedStr}</div>
						<div><span style="color:var(--muted);">字数统计：</span>${charCount} 字</div>
					</div>
					<div style="margin-top:14px;border-top:1px solid var(--border);padding-top:10px;">
						<div style="font-size:calc(var(--font-size)*0.786);font-weight:600;color:var(--muted);margin-bottom:6px;letter-spacing:0.05em;">目录 (TOC)</div>
						<div id="np-toc">${tocHtml}</div>
					</div>
				</div>
			`, { panelClass: ' edit-panel' });

			const close = () => this.closeOverlay('note-props');
			propsPanel.querySelector('#np-close').onclick = close;
			// TOC 点击跳转
			propsPanel.querySelectorAll('.toc-item').forEach(item => {
				item.onmouseenter = () => { item.style.color = 'var(--accent)'; };
				item.onmouseleave = () => { item.style.color = 'var(--text)'; };
				item.onclick = () => {
					close();
					const previewEl = panel?.querySelector('#nt-preview');
					if (previewEl) {
						const headings = previewEl.querySelectorAll('h1, h2, h3');
						const idx = parseInt(item.dataset.tocLine);
						// 找到对应的标题元素
						let target = null;
						headings.forEach(h => { if (h.textContent.trim() === item.textContent.trim() && !target) target = h; });
						if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
					}
				};
			});
		},

		/** 在 textarea 中插入 Markdown 语法 */
		_insertMdSyntax(textarea, action, note, autoSave) {
			const s = textarea.selectionStart, e = textarea.selectionEnd, sel = textarea.value.slice(s, e);
			const insertions = {
				bold: { before: '**', after: '**', placeholder: '粗体文字' },
				italic: { before: '*', after: '*', placeholder: '斜体文字' },
				h1: { before: '# ', after: '', placeholder: '一级标题', line: true },
				h2: { before: '## ', after: '', placeholder: '二级标题', line: true },
				h3: { before: '### ', after: '', placeholder: '三级标题', line: true },
				code: { before: '`', after: '`', placeholder: 'code' },
				codeblock: { before: '```\n', after: '\n```', placeholder: '代码', line: true },
				link: { before: '[', after: '](url)', placeholder: '链接文字' },
				list: { before: '- ', after: '', placeholder: '列表项', line: true },
				tasklist: { before: '- [ ] ', after: '', placeholder: '任务项', line: true },
				table: { before: '| 列1 | 列2 | 列3 |\n| --- | --- | --- |\n| 内容 | 内容 | 内容 |', after: '', placeholder: '', line: true },
				quote: { before: '> ', after: '', placeholder: '引用文字', line: true },
				hr: { before: '\n---\n', after: '', placeholder: '' },
			};
			const ins = insertions[action];
			if (!ins) return;
			const text = sel || ins.placeholder;
			let insert;
			if (ins.line) {
				// 确保在行首
				const lineStart = textarea.value.lastIndexOf('\n', s - 1) + 1;
				const prefix = (s > lineStart && textarea.value.slice(lineStart, s).trim()) ? '\n' : '';
				insert = prefix + ins.before + text + ins.after;
			} else {
				insert = ins.before + text + ins.after;
			}
			textarea.setRangeText(insert, s, e, 'end');
			textarea.focus();
			note.content = textarea.value;
			autoSave();
		},

		/** 删除笔记 */
		deleteNote(noteId, panel) {
			const idx = state.notes.findIndex(n => n.id === noteId);
			if (idx === -1) return;
			const delNote = state.notes[idx];
			state.notes.splice(idx, 1);
			if (this._currentNoteId === noteId) this._currentNoteId = null;
			saveNotes();
			this.renderNotesList(panel);
			// 清空编辑器
			const editorEl = panel?.querySelector('#nt-editor');
			if (editorEl) editorEl.innerHTML = `<div class="notes-empty" id="nt-empty">${I.edit}<div style="font-size:calc(var(--font-size)*0.929);font-weight:600;">选择或新建一篇笔记</div></div>`;
			const footInfo = panel?.querySelector('#m-foot-info');
			if (footInfo) footInfo.textContent = `${state.notes.length} 篇笔记`;
			showUndoToast(`已删除「${delNote.title}」`, () => {
				state.notes.splice(idx, 0, delNote);
				saveNotes(); this.renderNotesList(panel);
				if (footInfo) footInfo.textContent = `${state.notes.length} 篇笔记`;
			});
		},

		/** 导出单篇笔记为 .md */
		exportNoteAsMd(note) {
			const blob = new Blob([`# ${note.title}\n\n${note.content || ''}`], { type: 'text/markdown' });
			const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
			a.download = `${note.title || '笔记'}.md`; a.click(); URL.revokeObjectURL(a.href);
			toast('笔记已导出');
		},

		/** 导入 .md 文件创建新笔记 */
		importNoteFromMd(panel) {
			const inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.md,.txt';
			inp.onchange = e => {
				const file = e.target.files[0]; if (!file) return;
				const reader = new FileReader();
				reader.onload = ev => {
					const text = ev.target.result || '';
					// 提取标题：取第一行 # 标题，或文件名
					let title = file.name.replace(/\.(md|txt)$/i, '');
					const firstLine = text.split('\n')[0];
					if (/^#\s+/.test(firstLine)) { title = firstLine.replace(/^#\s+/, ''); }
					const content = text.replace(/^#\s+.+\n?/, '').trim();
					const note = { id: 'nt_' + Date.now() + '_' + Math.random().toString(36).slice(2, 5), title, content, pinned: false, createdAt: Date.now(), updatedAt: Date.now() };
					state.notes.unshift(note); saveNotes();
					this._currentNoteId = note.id;
					this.renderNotesList(panel); this.openNote(note.id, panel);
					toast(`已导入「${title}」`);
				};
				reader.readAsText(file);
			};
			inp.click();
		},

		// ══════════════════════════════════════════════════
		//  VIDEO PARSE METHODS
		// ══════════════════════════════════════════════════
		/** iframe 内嵌播放器 */
		openVideoPlayer(url, parserUrl, videoUrl) {
			const parsers = (state.settings.videoParsers || DEFAULT_VIDEO_PARSERS).filter(p => p.enabled !== false);

			const parserOptions = parsers.map(p =>
				`<option value="${escapeHTML(p.url)}" ${p.url === parserUrl ? 'selected' : ''}>${escapeHTML(p.name)}</option>`
			).join('');

			const { ov, panel } = this.makeOverlay('video-player', `
				<div class="panel-head">
					<div class="head-logo">${I.play}</div>
					<h2>视频播放</h2>
					<select id="vp-player-source" style="max-width:140px;font-size:calc(var(--font-size)*0.786);padding:6px 6px;">${parserOptions}</select>
					<button class="btn-icon" id="vp-player-open" title="新标签页打开">${I.extLink}</button>
					<button class="btn-icon" id="vp-player-close">${I.x}</button>
				</div>
				<div class="panel-body" style="padding:0;flex:1;display:flex;">
					<iframe src="${escapeHTML(url)}" id="vp-player-iframe" style="width:100%;height:100%;min-height:60vh;border:none;" allow="autoplay;encrypted-media;fullscreen" allowfullscreen referrerpolicy="no-referrer"></iframe>
				</div>
			`, { panelClass: ' video-player-panel', persistent: true });

			const iframe = panel.querySelector('#vp-player-iframe');
			const sourceSelect = panel.querySelector('#vp-player-source');

			// 切换解析源
			if (sourceSelect && videoUrl) {
				sourceSelect.onchange = () => {
					const newParserUrl = sourceSelect.value;
					iframe.src = buildParsedUrl(newParserUrl, videoUrl);
				};
			}

			panel.querySelector('#vp-player-close').onclick = () => this.closeOverlay('video-player');
			panel.querySelector('#vp-player-open').onclick = () => {
				const currentSrc = iframe.src || url;
				if (typeof GM_openInTab === 'function') GM_openInTab(currentSrc, { active: true, insert: true });
				else window.open(currentSrc, '_blank');
			};
		},

		/** 解析源管理弹窗 */
		openVideoParserManager(mainPanel) {
			const parsers = JSON.parse(JSON.stringify(state.settings.videoParsers || DEFAULT_VIDEO_PARSERS));

			const renderList = (listEl) => {
				listEl.innerHTML = parsers.map((p, i) => `
					<div class="tag-row" data-idx="${i}" style="gap:8px;">
						<input type="checkbox" ${p.enabled !== false ? 'checked' : ''} data-role="toggle" style="flex-shrink:0;" title="启用/禁用">
						<input type="text" value="${escapeHTML(p.name)}" placeholder="名称" data-role="name" style="width:80px;flex:none;">
						<input type="text" value="${escapeHTML(p.url)}" placeholder="解析接口 URL（需含 ?url= 等参数）" data-role="url" class="flex-1">
						<button class="btn-icon" data-role="del" title="删除" style="color:#f87171;flex-shrink:0;">${I.trash}</button>
					</div>
				`).join('');

				listEl.querySelectorAll('.tag-row').forEach(row => {
					const idx = parseInt(row.dataset.idx);
					row.querySelector('[data-role="toggle"]').onchange = (e) => { parsers[idx].enabled = e.target.checked; };
					row.querySelector('[data-role="name"]').oninput = (e) => { parsers[idx].name = e.target.value; };
					row.querySelector('[data-role="url"]').oninput = (e) => { parsers[idx].url = e.target.value; };
					row.querySelector('[data-role="del"]').onclick = () => { parsers.splice(idx, 1); renderList(listEl); };
				});
			};

			const { ov, panel } = this.makeOverlay('vp-parser-mgr', `
				<div class="panel-head">
					<div class="head-logo">${I.edit}</div>
					<h2>管理解析源</h2>
					<button class="btn-icon" id="vpm-close">${I.x}</button>
				</div>
				<div class="panel-body">
					<p style="font-size:calc(var(--font-size)*0.786);color:var(--muted);margin-bottom:10px;">添加或编辑视频解析接口。URL 需包含查询参数占位（如 <code>?url=</code>），脚本会自动拼接视频地址。</p>
					<div id="vpm-list"></div>
					<button class="btn btn-ghost" id="vpm-add" style="width:100%;justify-content:center;margin-top:8px;border-style:dashed;border-color:var(--accent);color:var(--accent);">${I.plus} 添加解析源</button>
				</div>
				<div class="panel-foot">
					<button class="btn btn-ghost" id="vpm-reset" title="恢复默认解析源">恢复默认</button>
					<div style="margin-left:auto"></div>
					<button class="btn btn-ghost" id="vpm-cancel">取消</button>
					<button class="btn btn-primary" id="vpm-save">${I.check} 保存</button>
				</div>
			`, { panelClass: ' edit-panel' });

			const listEl = panel.querySelector('#vpm-list');
			renderList(listEl);

			panel.querySelector('#vpm-add').onclick = () => {
				parsers.push({ name: '新解析源', url: '', enabled: true });
				renderList(listEl);
				listEl.lastElementChild?.querySelector('[data-role="url"]')?.focus();
			};

			panel.querySelector('#vpm-reset').onclick = () => {
				parsers.length = 0;
				DEFAULT_VIDEO_PARSERS.forEach(p => parsers.push({ ...p }));
				renderList(listEl);
				toast('已恢复默认解析源');
			};

			const close = () => this.closeOverlay('vp-parser-mgr');
			panel.querySelector('#vpm-close').onclick = close;
			panel.querySelector('#vpm-cancel').onclick = close;

			panel.querySelector('#vpm-save').onclick = () => {
				const valid = parsers.filter(p => p.name.trim() && p.url.trim());
				if (!valid.length) { toast('至少保留一个有效解析源'); return; }
				state.settings.videoParsers = valid;
				if (state.settings.videoDefaultParser >= valid.length) state.settings.videoDefaultParser = 0;
				saveSettings();
				close();
				// 刷新 Tab 内容
				if (mainPanel) {
					const tabContent = mainPanel.querySelector('.tab-content[data-tab="videoparse"]');
					if (tabContent) {
						tabContent.innerHTML = TAB_REGISTRY.videoparse.buildContent();
						TAB_REGISTRY.videoparse.setupEvents(mainPanel, this);
					}
				}
				toast(`已保存 ${valid.length} 个解析源`);
			};
		},

		// ══════════════════════════════════════════════════
		//  SETTINGS PANEL
		// ══════════════════════════════════════════════════
		openSettings(scrollToSection = null) {
			const savedSettingsSnap = JSON.parse(JSON.stringify(state.settings));
			const draft = {
				theme: state.settings.theme,
				font: state.settings.font,
				listMode: state.settings.listMode,
				hotkeys: { ...state.settings.hotkeys },
				statuses: JSON.parse(JSON.stringify(state.settings.dict.statuses)),
				ui: { ...state.settings.ui },
				ball: { ...state.settings.ball },
			};

			const ballCfg = draft.ball;
			const curFontSize = draft.ui.fontSize || 16;
			const curBallSize = ballCfg.size || 42;
			const curBallOpacity = ballCfg.bgOpacity !== undefined ? ballCfg.bgOpacity : 1.0;

			const { ov, panel } = this.makeOverlay('settings', `
				<div class="panel-head">
					<div class="head-logo">${I.gear}</div>
					<h2>助手设置</h2>
					<button class="btn-icon" id="s-close">${I.x}</button>
				</div>
				<div style="flex:1;overflow:hidden;display:flex;flex-direction:column;">
					<div class="settings-layout" style="flex:1;overflow:hidden;">
						<nav class="settings-nav" id="s-nav">
							<div class="settings-nav-section">外观</div>
							<button class="settings-nav-item active" data-sec="appearance">${I.sun} 主题与字体</button>
							<button class="settings-nav-item" data-sec="layout">${I.sliders} 外观布局</button>
							<div class="settings-nav-section">功能</div>
							<button class="settings-nav-item" data-sec="hotkeys">${I.zap} 快捷操作</button>
							<button class="settings-nav-item" data-sec="ball">${I.compass} 悬浮球</button>
							<button class="settings-nav-item" data-sec="panel-pages">${I.sliders} 面板页面</button>
							<button class="settings-nav-item" data-sec="filter">${I.filter} 页面过滤</button>
							<div class="settings-nav-section">字典</div>
							<button class="settings-nav-item" data-sec="types">${I.tag} 剧集类型</button>
							<button class="settings-nav-item" data-sec="statuses">${I.status} 追剧状态</button>
							<button class="settings-nav-item" data-sec="platform-cats">${I.grid} 平台分类</button>
							<div class="settings-nav-section">数据</div>
							<button class="settings-nav-item" data-sec="webdav">${I.cloudUpload} WebDAV</button>
							<button class="settings-nav-item" data-sec="data">${I.download} 数据与关于</button>
						</nav>
						<div class="settings-content" id="s-content">

							<!-- APPEARANCE -->
							<div class="settings-section active" data-sec="appearance">
								<div class="settings-card">
									<div class="settings-card-title">${I.sun} 颜色主题</div>
									<div class="theme-group-label">深色系</div>
									<div class="theme-grid" id="s-themes-dark"></div>
									<div class="theme-group-label">浅色系</div>
									<div class="theme-grid" id="s-themes-light"></div>
									<div class="muted-sm" id="s-theme-name">当前：${THEMES[draft.theme]?.name || ''}</div>
								</div>
								<div class="settings-card">
									<div class="settings-card-title">${I.edit} 字体设置</div>
									<div class="setting-inline-row">
										<span class="setting-inline-label">界面字体</span>
										<select id="s-font">${Object.entries(FONTS).map(([k, f]) => `<option value="${k}" ${draft.font === k ? 'selected' : ''}>${f.name}</option>`).join('')}</select>
									</div>
									<div class="setting-inline-row">
										<span class="setting-inline-label">字体大小</span>
										<input type="range" id="s-fontsize" min="12" max="24" step="1" value="${curFontSize}">
										<span class="setting-inline-val" id="s-fontsize-val">${curFontSize}px</span>
										<button class="btn-icon pad-xs" data-reset-slider="s-fontsize" data-reset-val="${DEFAULT_UI.fontSize}" title="恢复默认 ${DEFAULT_UI.fontSize}px" >${I.undo}</button>
									</div>
								</div>
							</div>

							<!-- LAYOUT -->
							<div class="settings-section" data-sec="layout">
								<div class="settings-card">
									<div class="settings-card-title">${I.sliders} 圆角</div>
									<div class="form-group">
										<div class="slider-row">
											<span class="slider-label">整体圆角</span>
											<input type="range" id="s-radius" min="0" max="24" step="1" value="${draft.ui.radius}">
											<span class="slider-val" id="s-radius-val">${draft.ui.radius}px</span>
										<button class="btn-icon pad-xs" data-reset-slider="s-radius" data-reset-val="${DEFAULT_UI.radius}" title="恢复默认 ${DEFAULT_UI.radius}px" >${I.undo}</button>
										</div>
									</div>
									<div class="form-group">
										<div class="slider-row">
											<span class="slider-label">图标圆角</span>
											<input type="range" id="s-icon-radius" min="0" max="24" step="1" value="${draft.ui.platformIconRadius ?? 12}">
											<span class="slider-val" id="s-icon-radius-val">${draft.ui.platformIconRadius ?? 12}px</span>
										<button class="btn-icon pad-xs" data-reset-slider="s-icon-radius" data-reset-val="${DEFAULT_UI.platformIconRadius}" title="恢复默认 ${DEFAULT_UI.platformIconRadius}px" >${I.undo}</button>
										</div>
									</div>
								</div>
								<div class="settings-card">
									<div class="settings-card-title">${I.sliders} 面板尺寸与效果</div>
									<p style="font-size:calc(var(--font-size) * 0.8);color:var(--muted);margin-bottom:10px;">打开对应面板后可实时调节宽度、透明度和遮罩模糊。</p>
									<div style="display:flex;gap:7px;">
										<button class="btn btn-ghost" id="s-tune-main"     style="flex:1;justify-content:center;font-size:calc(var(--font-size) * 0.8);">管理面板</button>
										<button class="btn btn-ghost" id="s-tune-edit"     style="flex:1;justify-content:center;font-size:calc(var(--font-size) * 0.8);">编辑面板</button>
										<button class="btn btn-ghost" id="s-tune-settings" style="flex:1;justify-content:center;font-size:calc(var(--font-size) * 0.8);">设置面板</button>
									</div>
								</div>
								<div class="settings-card">
									<div class="settings-card-title">${I.sliders} 管理面板高度</div>
									<label class="cb-row" style="margin-bottom:10px;"><input type="checkbox" id="s-height-auto" ${draft.ui.mainHeightAuto !== false ? 'checked' : ''}> 自动高度（根据内容自适应，不超过最大高度）</label>
									<div class="form-group" id="s-height-min-group" style="${draft.ui.mainHeightAuto !== false ? 'opacity:0.4;pointer-events:none;' : ''}">
										<div class="slider-row">
											<span class="slider-label">最小高度</span>
											<input type="range" id="s-height-min" min="200" max="900" step="10" value="${draft.ui.mainHeightMin || 400}">
											<span class="slider-val" id="s-height-min-val">${draft.ui.mainHeightMin || 400}px</span>
										<button class="btn-icon pad-xs" data-reset-slider="s-height-min" data-reset-val="${DEFAULT_UI.mainHeightMin}" title="恢复默认 ${DEFAULT_UI.mainHeightMin}px" >${I.undo}</button>
										</div>
									</div>
									<div class="form-group">
										<div class="slider-row">
											<span class="slider-label">最大高度</span>
											<input type="range" id="s-height-max" min="200" max="900" step="10" value="${draft.ui.mainHeightMax || 700}">
											<span class="slider-val" id="s-height-max-val">${draft.ui.mainHeightMax || 700}px</span>
										<button class="btn-icon pad-xs" data-reset-slider="s-height-max" data-reset-val="${DEFAULT_UI.mainHeightMax}" title="恢复默认 ${DEFAULT_UI.mainHeightMax}px" >${I.undo}</button>
										</div>
									</div>
								</div>
								<!-- 卡片风格 -->
								<div class="settings-card">
									<div class="settings-card-title">${I.cardToggle} 卡片风格</div>
									<div class="mode-radio-group" style="margin-bottom:8px;">
										<label><input type="radio" name="card-style" value="classic"   ${state.settings.cardStyle === 'classic' ? 'checked' : ''}> 经典卡片（横版封面）</label>
										<label><input type="radio" name="card-style" value="immersive" ${state.settings.cardStyle === 'immersive' ? 'checked' : ''}> 沉浸卡片（竖版海报）</label>
									</div>
									<p style="font-size:calc(var(--font-size) * 0.8);color:var(--muted);">仅对卡片视图生效；在管理面板工具栏也可快速切换。</p>
								</div>
							</div>

							<!-- HOTKEYS -->
							<div class="settings-section" data-sec="hotkeys">
								<!-- 快速记录选项 -->
								<div class="settings-card">
									<div class="settings-card-title">${I.edit} 快速记录选项</div>
									<label class="cb-row"><input type="checkbox" id="s-auto-clean" ${state.settings.autoCleanTitle !== false ? 'checked' : ''}> 默认启用标题正则清洗</label>
									<p class="muted-sm">去除页面标题中的网站后缀、广告词等干扰字符。</p>
									<label class="cb-row" style="margin-top:10px;"><input type="checkbox" id="s-enable-reminder" ${state.settings.enableReminder !== false ? 'checked' : ''}> 启用追剧更新提醒</label>
									<p class="muted-sm">在追剧周期日自动弹出系统通知提醒更新。</p>
								</div>
								<div class="settings-card">
									<div class="settings-card-title">${I.zap} 快捷键配置</div>
									<div class="form-group">
										<label class="form-label">打开管理面板</label>
										<div class="input-row">
											<input type="text" id="s-hotkey-main"   value="${draft.hotkeys.main}"   readonly class="flex-1">
											<button class="btn btn-ghost nowrap" id="s-hotkey-main-capture"   >${I.edit} 捕获</button>
											<button class="btn-icon"      id="s-hotkey-main-reset"     title="重置">${I.undo}</button>
										</div>
									</div>
									<div class="form-group">
										<label class="form-label">观影平台</label>
										<div class="input-row">
											<input type="text" id="s-hotkey-platforms" value="${draft.hotkeys.platforms || ''}" readonly class="flex-1">
											<button class="btn btn-ghost nowrap" id="s-hotkey-platforms-capture" >${I.edit} 捕获</button>
											<button class="btn-icon"      id="s-hotkey-platforms-reset"   title="重置">${I.undo}</button>
										</div>
									</div>
										<div class="form-group">
										<label class="form-label">快速记录</label>
										<div class="input-row">
											<input type="text" id="s-hotkey-record" value="${draft.hotkeys.record}" readonly class="flex-1">
											<button class="btn btn-ghost nowrap" id="s-hotkey-record-capture" >${I.edit} 捕获</button>
											<button class="btn-icon"      id="s-hotkey-record-reset"   title="重置">${I.undo}</button>
										</div>
									</div>
									<div class="form-group">
										<label class="form-label">网页导航</label>
										<div class="input-row">
											<input type="text" id="s-hotkey-navlinks" value="${draft.hotkeys.navlinks || ''}" readonly class="flex-1">
											<button class="btn btn-ghost nowrap" id="s-hotkey-navlinks-capture" >${I.edit} 捕获</button>
											<button class="btn-icon"      id="s-hotkey-navlinks-reset"   title="重置">${I.undo}</button>
										</div>
									</div>
									<div class="form-group">
										<label class="form-label">笔记</label>
										<div class="input-row">
											<input type="text" id="s-hotkey-notes" value="${draft.hotkeys.notes || ''}" readonly class="flex-1">
											<button class="btn btn-ghost nowrap" id="s-hotkey-notes-capture" >${I.edit} 捕获</button>
											<button class="btn-icon"      id="s-hotkey-notes-reset"   title="重置">${I.undo}</button>
										</div>
									</div>
									<div class="form-group">
										<label class="form-label">观看记录</label>
										<div class="input-row">
											<input type="text" id="s-hotkey-openRecords" value="${draft.hotkeys.openRecords || ''}" readonly class="flex-1">
											<button class="btn btn-ghost nowrap" id="s-hotkey-openRecords-capture" >${I.edit} 捕获</button>
											<button class="btn-icon"      id="s-hotkey-openRecords-reset"   title="重置">${I.undo}</button>
										</div>
									</div>
								<div class="form-group">
										<label class="form-label">时钟工具</label>
										<div class="input-row">
											<input type="text" id="s-hotkey-timer" value="${draft.hotkeys.timer || ''}" readonly class="flex-1">
											<button class="btn btn-ghost nowrap" id="s-hotkey-timer-capture" >${I.edit} 捕获</button>
											<button class="btn-icon"      id="s-hotkey-timer-reset"   title="重置">${I.undo}</button>
										</div>
									</div>
									<p class="muted-sm">在捕获状态下按下 Delete 或 Backspace可清除快捷键。</p>
								</div>
							</div>

							<!-- BALL -->
							<div class="settings-section" data-sec="ball">
								<div class="settings-card">
									<div class="settings-card-title">${I.compass} 悬浮球设置</div>
									<div class="form-group">
										<label class="form-label">显示位置</label>
										<select id="s-ball-preset">
											<option value="lt">左侧顶部</option><option value="lm">左侧中部</option><option value="lb">左侧底部</option>
											<option value="rt">右侧顶部</option><option value="rm">右侧中部</option><option value="rb">右侧底部</option>
										</select>
									</div>
									<div class="form-group">
										<div class="slider-row">
											<span class="slider-label">大小</span>
											<input type="range" id="s-ball-size" min="30" max="60" step="2" value="${curBallSize}">
											<span class="slider-val" id="s-ball-size-val">${curBallSize}px</span>
										<button class="btn-icon pad-xs" data-reset-slider="s-ball-size" data-reset-val="${DEFAULT_BALL.size}" title="恢复默认 ${DEFAULT_BALL.size}px" >${I.undo}</button>
										</div>
									</div>
									<div class="form-group">
										<div class="slider-row">
											<span class="slider-label">透明度</span>
											<input type="range" id="s-ball-opacity" min="0" max="1" step="0.05" value="${curBallOpacity}">
											<span class="slider-val" id="s-ball-opacity-val">${Math.round(curBallOpacity * 100)}%</span>
										<button class="btn-icon pad-xs" data-reset-slider="s-ball-opacity" data-reset-val="${DEFAULT_BALL.bgOpacity}" title="恢复默认 ${Math.round(DEFAULT_BALL.bgOpacity * 100)}%" >${I.undo}</button>
										</div>
									</div>
									<div class="form-group">
										<label class="form-label">单击行为</label>
										<div class="mode-radio-group">
											<label><input type="radio" name="click-mode" value="single-main"   ${state.settings.clickMode === 'single-main' ? 'checked' : ''}> 单击管理 / 双击记录</label>
											<label><input type="radio" name="click-mode" value="single-record" ${state.settings.clickMode === 'single-record' ? 'checked' : ''}> 单击记录 / 双击管理</label>
										</div>
									</div>
									<div class="form-group">
										<label class="cb-row"><input type="checkbox" id="s-ball" ${state.settings.enableBall ? 'checked' : ''}> 启用悬浮球</label>
									</div>
								</div>
							</div>

							<!-- PANEL PAGES -->
								<div class="settings-section" data-sec="panel-pages">
									<div class="settings-card">
										<div class="settings-card-title">${I.compass} 面板页面管理</div>
										<div class="form-group">
											<div id="s-tab-order-list" style="display:flex;flex-direction:column;gap:3px;">
												${state.settings.tabOrder.map(id => {
													const isEnabled = state.settings.enabledTabs.includes(id);
													return `<div class="tab-order-item" data-tab="${id}" style="display:flex;align-items:center;gap:6px;padding:4px 6px;border-radius:var(--radius-sm);border:1px solid var(--border);background:var(--surface);">
														<input type="checkbox" class="tab-order-cb" data-tab="${id}" ${isEnabled ? 'checked' : ''} style="accent-color:var(--accent);">
														<span style="flex:1;font-size:calc(var(--font-size)*0.857);">${TAB_LABELS[id] || id}</span>
														<button class="btn-icon tab-order-up" data-tab="${id}" title="上移" style="padding:2px 4px;">↑</button>
														<button class="btn-icon tab-order-down" data-tab="${id}" title="下移" style="padding:2px 4px;">↓</button>
													</div>`;
												}).join('')}
											</div>
										</div>
										<div class="form-group">
											<label class="form-label">管理面板默认页面</label>
											<select id="s-default-tab">
												${state.settings.tabOrder.filter(id => state.settings.enabledTabs.includes(id)).map(id => {
													return `<option value="${id}" ${state.settings.defaultTab === id ? 'selected' : ''}>${TAB_LABELS[id] || id}</option>`;
												}).join('')}
											</select>
										</div>
									</div>
								</div>

								<!-- FILTER -->
							<div class="settings-section" data-sec="filter">
								<div class="settings-card">
									<div class="settings-card-title">${I.filter} 页面过滤</div>
									<div class="form-group">
										<label class="form-label">过滤模式</label>
										<div class="mode-radio-group">
											<label><input type="radio" name="list-mode" value="black" ${draft.listMode === 'black' ? 'checked' : ''}> 黑名单（禁用列表内页面）</label>
											<label><input type="radio" name="list-mode" value="white" ${draft.listMode === 'white' ? 'checked' : ''}> 白名单（仅在列表内启用）</label>
										</div>
									</div>
									<div class="form-group">
										<label class="form-label">域名列表（每行一条，支持 * 通配）</label>
										<textarea id="s-list-domains" rows="4" placeholder="如：*.baidu.com">${(draft.listMode === 'black' ? state.settings.blacklist : state.settings.whitelist).join('\n')}</textarea>
									</div>
								</div>
							</div>


							<!-- TYPES -->
							<div class="settings-section" data-sec="types">
								<div class="settings-card">
									<div class="settings-card-title">${I.tag} 剧集类型</div>
									<p style="font-size:calc(var(--font-size)*0.786);color:var(--muted);margin-bottom:8px;">勾选「单集」表示该类型的剧集总集数自动锁定为1（如电影、纪录片）。</p>
									<div class="tag-editor" id="s-types-editor"></div>
									<button class="btn btn-ghost btn-add-full" id="s-add-type" >${I.plus} 新增类型</button>
								</div>
							</div>

							<!-- STATUSES -->
							<div class="settings-section" data-sec="statuses">
								<div class="settings-card">
									<div class="settings-card-title">${I.status} 追剧状态</div>
									<div class="tag-editor" id="s-statuses"></div>
									<button class="btn btn-ghost btn-add-full" id="s-add-status" >${I.plus} 新增状态</button>
								</div>
							</div>

							<!-- PLATFORM CATS -->
							<div class="settings-section" data-sec="platform-cats">
								<div class="settings-card">
									<div class="settings-card-title">${I.grid} 平台分类管理</div>
									<div class="tag-editor" id="s-platform-cats"></div>
									<button class="btn btn-ghost btn-add-full" id="s-add-platform-cat" >${I.plus} 新增分类</button>
								</div>
							</div>

							<!-- DATA -->
							<div class="settings-section" data-sec="data">
								<div class="settings-card">
									<div class="settings-card-title">${I.download} 备份与导入</div>
									<div style="display:flex;gap:8px;margin-bottom:10px;">
										<button class="btn btn-ghost btn-full" id="s-export" >${I.upload} 导出备份</button>
										<button class="btn btn-ghost btn-full" id="s-import" >${I.download} 导入数据</button>
									</div>
									<button class="btn btn-danger" id="s-reset" style="width:100%;justify-content:center;">${I.undo} 数据重置</button>
								</div>
								<div class="settings-card">
									<div class="about-section">
										<strong>万象 Omni Trail v${VERSION}</strong><br>
										作者：u-luck & AI<br>
										<a href="mailto:one.lucky.ha@gmail.com" style="color:var(--accent);text-decoration:none;">one.lucky.ha@gmail.com</a>
										&nbsp;·&nbsp;
										<a href="${SPACE_URL}" target="_blank" style="color:var(--accent);text-decoration:none;">B站主页</a>
										<br>
										<a href="${HELP_URL}" target="_blank" style="color:var(--accent);text-decoration:none;">查看使用帮助 →</a>
										<hr style="border:none;border-top:1px solid var(--border);margin:10px 0;" />
										<p style="font-size:calc(var(--font-size) * 0.714);color:var(--muted);line-height:1.6;text-align:left;">
											⚠️ <strong>免责声明</strong><br>
											1. 本脚本仅供学习交流使用，请于下载后 24 小时内删除，不得用于商业用途。<br>
											2. 本工具不提供任何视频资源或破解功能，仅辅助管理正版平台上的个人观看进度。<br>
											3. 所有用户数据均存储在本地浏览器中，开发者不收集任何个人信息。<br>
											4. 视频解析功能依赖第三方公共服务，稳定性与合法性不在本项目保障范围内。<br>
											5. 用户须自行确保使用行为符合所在地区法律法规，因使用本工具产生的一切后果由用户自行承担。<br>
											6. 本项目为开源学习项目，如涉及侵权请联系删除：<a href="mailto:one.lucky.ha@gmail.com" style="color:var(--accent);text-decoration:none;">one.lucky.ha@gmail.com</a>
										</p>
									</div>
								</div>
							</div>

							<!-- WEBDAV -->
							<div class="settings-section" data-sec="webdav">
								<div class="settings-card">
									<div class="settings-card-title">${I.cloudUpload} WebDAV 配置</div>
									<div style="display:flex;align-items:center;gap:7px;margin-bottom:12px;font-size:calc(var(--font-size) * 0.786);color:var(--muted);">
										<span id="webdav-status-dot" style="width:8px;height:8px;border-radius:50%;background:var(--muted);flex-shrink:0;display:inline-block;"></span>
										<span id="webdav-status-text">加载中…</span>
									</div>
									<div class="form-group">
										<label class="form-label">服务器地址</label>
										<input type="text" id="webdav-server" placeholder="https://dav.jianguoyun.com/dav/">
									</div>
									<div class="form-group">
										<label class="form-label">用户名</label>
										<input type="text" id="webdav-username" placeholder="your@email.com">
									</div>
									<div class="form-group">
										<label class="form-label">应用密码</label>
										<div class="inline-row">
											<input type="password" id="webdav-password" placeholder="请输入坚果云生成的应用密码" class="flex-1">
											<button class="btn-icon" id="toggle-password-visibility" title="显示/隐藏">${I.eye}</button>
										</div>
									</div>
									<div class="form-group">
										<label class="form-label">云端文件名</label>
										<input type="text" id="webdav-filename" placeholder="omni-trail_backup.json">
									</div>
									<div style="display:flex;gap:8px;margin-bottom:10px;">
										<button class="btn btn-ghost btn-full"   id="webdav-test" >🔌 测试连接</button>
										<button class="btn btn-primary btn-full" id="webdav-save" >💾 保存配置</button>
									</div>
									<div style="display:flex;gap:8px;">
										<button class="btn btn-ghost btn-full" id="webdav-upload"   >${I.cloudUpload} 上传到云端</button>
										<button class="btn btn-ghost btn-full" id="webdav-download" >${I.cloudDownload} 从云端下载</button>
									</div>
									<p style="font-size:calc(var(--font-size) * 0.733);color:#f87171;margin-top:10px;line-height:1.6;">提示：请使用坚果云生成的"应用密码"，密码仅保存在本机浏览器存储中，重置可自定义是否清空WebDAV配置。</p>
								</div>
							</div>

						</div><!-- /settings-content -->
					</div><!-- /settings-layout -->
				</div>
				<div class="panel-foot">
					<button class="btn btn-ghost"           id="s-cancel">取消</button>
					<button class="btn btn-primary ml-auto" id="s-save">${I.check} 保存设置</button>
				</div>
			`, { panelClass: ' settings-panel' });

			// 导航切换逻辑
			const navItems = panel.querySelectorAll('.settings-nav-item');
			const sections = panel.querySelectorAll('.settings-section');
			navItems.forEach(item => {
				item.addEventListener('click', () => {
					const sec = item.dataset.sec;
					navItems.forEach(n => n.classList.remove('active'));
					item.classList.add('active');
					sections.forEach(s => s.classList.toggle('active', s.dataset.sec === sec));
				});
			});

			// 如有 scrollToSection 需求，激活对应 tab
			if (scrollToSection) {
				const targetNav = panel.querySelector(`.settings-nav-item[data-sec="${scrollToSection}"]`);
				const targetSec = panel.querySelector(`.settings-section[data-sec="${scrollToSection}"]`);
				if (targetNav && targetSec) {
					navItems.forEach(n => n.classList.remove('active'));
					targetNav.classList.add('active');
					sections.forEach(s => s.classList.toggle('active', s === targetSec));
				}
			}

			// 主题色块渲染
			const renderSwatches = () => {
				['dark', 'light'].forEach(group => {
					const c = panel.querySelector(`#s-themes-${group}`); if (!c) return; c.innerHTML = '';
					Object.entries(THEMES).filter(([, v]) => !!v.dark === (group === 'dark')).forEach(([k, v]) => {
						const sw = document.createElement('div');
						sw.className = 'theme-swatch' + (draft.theme === k ? ' active' : '');
						sw.title = v.name; sw.dataset.theme = k;
						sw.style.background = `linear-gradient(135deg, ${v.surface}, ${v.accent})`;
						sw.onclick = () => {
							draft.theme = k; state.settings.theme = k; App.applyTheme();
							const nameEl = panel.querySelector('#s-theme-name');
							if (nameEl) nameEl.textContent = '当前：' + v.name;
							panel.querySelectorAll('.theme-swatch').forEach(s => s.classList.toggle('active', s === sw));
						};
						c.appendChild(sw);
					});
				});
			};
			renderSwatches();

			// 字体（立即生效）
			panel.querySelector('#s-font').onchange = e => {
				draft.font = e.target.value; state.settings.font = draft.font; App.applyTheme();
			};

			// 字体大小（立即生效）
			const fontSizeInput = panel.querySelector('#s-fontsize');
			const fontSizeVal = panel.querySelector('#s-fontsize-val');
			fontSizeInput.oninput = () => {
				const val = parseInt(fontSizeInput.value);
				draft.ui.fontSize = val; state.settings.ui.fontSize = val;
				fontSizeVal.textContent = val + 'px'; App.applyTheme();
			};

			// 圆角（立即生效）
			panel.querySelector('#s-radius').oninput = () => {
				const val = parseInt(panel.querySelector('#s-radius').value);
				draft.ui.radius = val; draft.ui.radiusSm = Math.max(4, Math.round(val * 0.45));
				state.settings.ui.radius = draft.ui.radius; state.settings.ui.radiusSm = draft.ui.radiusSm;
				panel.querySelector('#s-radius-val').textContent = val + 'px'; App.applyTheme();
			};
			panel.querySelector('#s-icon-radius').oninput = () => {
				const val = parseInt(panel.querySelector('#s-icon-radius').value);
				draft.ui.platformIconRadius = val; state.settings.ui.platformIconRadius = val;
				panel.querySelector('#s-icon-radius-val').textContent = val + 'px'; App.applyTheme();
			};

			// 面板尺寸调节
			panel.querySelector('#s-tune-main').onclick = () => { App.closeOverlay('settings'); App.openMain(); App.showTunerBar('main'); };
			panel.querySelector('#s-tune-edit').onclick = () => { App.closeOverlay('settings'); App.openRecord(); App.showTunerBar('edit'); };
			panel.querySelector('#s-tune-settings').onclick = () => { App.closeOverlay('settings'); App.openSettings(); App.showTunerBar('settings'); };

			// 面板高度设置（立即生效）
			const heightAutoCb = panel.querySelector('#s-height-auto');
			const heightMinInput = panel.querySelector('#s-height-min');
			const heightMinVal = panel.querySelector('#s-height-min-val');
			const heightMinGroup = panel.querySelector('#s-height-min-group');
			const heightMaxInput = panel.querySelector('#s-height-max');
			const heightMaxVal = panel.querySelector('#s-height-max-val');
			const applyHeightLive = () => {
				const isAuto = heightAutoCb.checked;
				let hMin = parseInt(heightMinInput.value);
				let hMax = parseInt(heightMaxInput.value);
				// 联动限制：min 不能超过 max，max 不能低于 min
				if (hMin > hMax) { hMin = hMax; heightMinInput.value = hMin; }
				if (hMax < hMin) { hMax = hMin; heightMaxInput.value = hMax; }
				draft.ui.mainHeightAuto = isAuto;
				draft.ui.mainHeightMin = hMin;
				draft.ui.mainHeightMax = hMax;
				state.settings.ui.mainHeightAuto = isAuto;
				state.settings.ui.mainHeightMin = hMin;
				state.settings.ui.mainHeightMax = hMax;
				heightMinVal.textContent = hMin + 'px';
				heightMaxVal.textContent = hMax + 'px';
				if (heightMinGroup) {
					heightMinGroup.style.opacity = isAuto ? '0.4' : '1';
					heightMinGroup.style.pointerEvents = isAuto ? 'none' : '';
				}
				App.applyTheme();
			};
			if (heightAutoCb) heightAutoCb.onchange = applyHeightLive;
			if (heightMinInput) heightMinInput.oninput = applyHeightLive;
			if (heightMaxInput) heightMaxInput.oninput = applyHeightLive;

			// 通用滑条重置按钮
			panel.querySelectorAll('[data-reset-slider]').forEach(btn => {
				btn.addEventListener('click', () => {
					const targetId = btn.dataset.resetSlider;
					const defaultVal = parseFloat(btn.dataset.resetVal);
					const input = panel.querySelector(`#${targetId}`);
					if (input && !isNaN(defaultVal)) {
						input.value = defaultVal;
						input.dispatchEvent(new Event('input'));
						input.dispatchEvent(new Event('change'));
					}
				});
			});

			// 悬浮球大小与透明度（立即生效）
			const ballSizeInput = panel.querySelector('#s-ball-size');
			const ballSizeVal = panel.querySelector('#s-ball-size-val');
			const ballOpacityInput = panel.querySelector('#s-ball-opacity');
			const ballOpacityVal = panel.querySelector('#s-ball-opacity-val');
			const applyBallLive = () => {
				const sz = parseInt(ballSizeInput.value);
				const op = parseFloat(ballOpacityInput.value);
				draft.ball.size = sz; draft.ball.bgOpacity = op;
				ballSizeVal.textContent = sz + 'px';
				ballOpacityVal.textContent = Math.round(op * 100) + '%';
				state.settings.ball.size = sz; state.settings.ball.bgOpacity = op;
				if (state.settings.enableBall) App.mountBall();
			};
			ballSizeInput.oninput = applyBallLive;
			ballOpacityInput.oninput = applyBallLive;

			// 悬浮球位置预设
			panel.querySelector('#s-ball-preset').value = detectBallPreset(state.settings.ballPos);
			panel.querySelector('#s-ball-preset').onchange = e => {
				const fn = BALL_PRESETS[e.target.value];
				if (fn) { state.settings.ballPos = fn(draft.ball.size || 42); if (state.settings.enableBall) App.mountBall(); }
			};

			// 页面管理（tabOrder）
			const tabOrderList = panel.querySelector('#s-tab-order-list');
			const defaultTabSelect = panel.querySelector('#s-default-tab');
			const updateDefaultTabOptions = () => {
				const enabledIds = [...tabOrderList.querySelectorAll('.tab-order-cb')].filter(cb => cb.checked).map(cb => cb.dataset.tab);
				const currentVal = defaultTabSelect.value;
				defaultTabSelect.innerHTML = enabledIds.map(id =>
					`<option value="${id}">${TAB_LABELS[id] || id}</option>`
				).join('');
				if (enabledIds.includes(currentVal)) defaultTabSelect.value = currentVal;
				else if (enabledIds.length) defaultTabSelect.value = enabledIds[0];
			};
			tabOrderList.addEventListener('change', (e) => {
				if (e.target.classList.contains('tab-order-cb')) updateDefaultTabOptions();
			});
			tabOrderList.addEventListener('click', (e) => {
				const btn = e.target.closest('.tab-order-up, .tab-order-down');
				if (!btn) return;
				const item = btn.closest('.tab-order-item');
				if (!item) return;
				if (btn.classList.contains('tab-order-up') && item.previousElementSibling) {
					tabOrderList.insertBefore(item, item.previousElementSibling);
				} else if (btn.classList.contains('tab-order-down') && item.nextElementSibling) {
					tabOrderList.insertBefore(item.nextElementSibling, item);
				}
				updateDefaultTabOptions();
			});

			// 快捷键捕获（支持留空）
			let capturingHandler = null;
			const captureHotkey = (type) => {
				if (capturingHandler) { document.removeEventListener('keydown', capturingHandler, true); capturingHandler = null; }
				const input = panel.querySelector(`#s-hotkey-${type}`);
				panel.querySelectorAll('#s-hotkey-main, #s-hotkey-record, #s-hotkey-platforms, #s-hotkey-navlinks, #s-hotkey-notes, #s-hotkey-openRecords, #s-hotkey-timer').forEach(el => el.classList.remove('hotkey-capturing'));
				input.classList.add('hotkey-capturing');
				input.value = '请按下快捷键组合…';
				capturingHandler = (e) => {
					e.preventDefault(); e.stopPropagation();
					// 支持留空：按 Delete 或 Backspace 清空快捷键
					if (e.key === 'Delete' || e.key === 'Backspace') {
						const combo = '';
						draft.hotkeys[type] = combo;
						input.value = combo;
						toast('快捷键已清除');
						input.classList.remove('hotkey-capturing');
						document.removeEventListener('keydown', capturingHandler, true);
						capturingHandler = null;
						return;
					}
					const keys = [];
					if (e.ctrlKey) keys.push('Ctrl');
					if (e.altKey) keys.push('Alt');
					if (e.shiftKey) keys.push('Shift');
					if (e.metaKey) keys.push('Meta');
					if (!['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) {
						const mainKey = e.key.length === 1 ? e.key.toUpperCase() : e.key;
						if (keys.length === 0) {
							toast('需包含至少一个修饰键（Ctrl/Alt/Shift）');
							input.value = draft.hotkeys[type] || '';
						} else {
							keys.push(mainKey);
							const combo = keys.join('+');
							draft.hotkeys[type] = combo; input.value = combo;
							toast(`快捷键已设置为 ${combo}`);
						}
						input.classList.remove('hotkey-capturing');
						document.removeEventListener('keydown', capturingHandler, true);
						capturingHandler = null;
					}
				};
				document.addEventListener('keydown', capturingHandler, true);
			};
			panel.querySelector('#s-hotkey-main-capture').onclick = () => captureHotkey('main');
			panel.querySelector('#s-hotkey-record-capture').onclick = () => captureHotkey('record');
			panel.querySelector('#s-hotkey-platforms-capture').onclick = () => captureHotkey('platforms');
			panel.querySelector('#s-hotkey-navlinks-capture').onclick = () => captureHotkey('navlinks');
			panel.querySelector('#s-hotkey-notes-capture').onclick = () => captureHotkey('notes');
			panel.querySelector('#s-hotkey-openRecords-capture').onclick = () => captureHotkey('openRecords');
			panel.querySelector('#s-hotkey-timer-capture').onclick = () => captureHotkey('timer');
			panel.querySelector('#s-hotkey-main-reset').onclick = () => { draft.hotkeys.main = DEFAULT_SETTINGS.hotkeys.main; panel.querySelector('#s-hotkey-main').value = draft.hotkeys.main; toast(`已重置为 ${draft.hotkeys.main}`); };
			panel.querySelector('#s-hotkey-record-reset').onclick = () => { draft.hotkeys.record = DEFAULT_SETTINGS.hotkeys.record; panel.querySelector('#s-hotkey-record').value = draft.hotkeys.record; toast(`已重置为 ${draft.hotkeys.record}`); };
			panel.querySelector('#s-hotkey-platforms-reset').onclick = () => { draft.hotkeys.platforms = DEFAULT_SETTINGS.hotkeys.platforms; panel.querySelector('#s-hotkey-platforms').value = draft.hotkeys.platforms; toast(`已重置为 ${draft.hotkeys.platforms}`); };
			panel.querySelector('#s-hotkey-navlinks-reset').onclick = () => { draft.hotkeys.navlinks = DEFAULT_SETTINGS.hotkeys.navlinks; panel.querySelector('#s-hotkey-navlinks').value = draft.hotkeys.navlinks; toast(`已重置为 ${draft.hotkeys.navlinks}`); };
			panel.querySelector('#s-hotkey-notes-reset').onclick = () => { draft.hotkeys.notes = DEFAULT_SETTINGS.hotkeys.notes; panel.querySelector('#s-hotkey-notes').value = draft.hotkeys.notes; toast(`已重置为 ${draft.hotkeys.notes}`); };
			panel.querySelector('#s-hotkey-openRecords-reset').onclick = () => { draft.hotkeys.openRecords = DEFAULT_SETTINGS.hotkeys.openRecords; panel.querySelector('#s-hotkey-openRecords').value = draft.hotkeys.openRecords; toast(`已重置为 ${draft.hotkeys.openRecords}`); };
			panel.querySelector('#s-hotkey-timer-reset').onclick = () => { draft.hotkeys.timer = DEFAULT_SETTINGS.hotkeys.timer; panel.querySelector('#s-hotkey-timer').value = draft.hotkeys.timer; toast(`已重置为 ${draft.hotkeys.timer}`); };

			// 剧集类型管理
			const draftTypes = state.settings.dict.types.map(t => typeof t === 'string' ? { name: t, single: false } : { ...t });
			const renderTypes = () => {
				const te = panel.querySelector('#s-types-editor'); if (!te) return; te.innerHTML = '';
				draftTypes.forEach((t, idx) => {
					const row = document.createElement('div'); row.className = 'tag-row'; row.draggable = true; row.dataset.idx = idx;
					row.innerHTML = `
						<span style="cursor:grab;color:var(--muted);flex-shrink:0;font-size:14px;" title="拖拽排序">⠿</span>
						<input type="text" value="${escapeHTML(t.name)}" placeholder="类型名称" class="flex-1">
						<label style="display:flex;align-items:center;gap:3px;font-size:calc(var(--font-size)*0.786);color:var(--muted);cursor:pointer;white-space:nowrap;flex-shrink:0;">
							<input type="checkbox" ${t.single ? 'checked' : ''} style="width:13px;height:13px;"> 单集
						</label>
						<button class="btn-icon" title="删除" style="color:#f87171;border-color:rgba(239,68,68,0.2);">${I.trash}</button>
					`;
					const nameInput = row.querySelector('input[type="text"]');
					const singleCb = row.querySelector('input[type="checkbox"]');
					nameInput.oninput = e => { draftTypes[idx].name = e.target.value; };
					singleCb.onchange = e => { draftTypes[idx].single = e.target.checked; };
					row.querySelector('.btn-icon').onclick = () => {
						if (draftTypes.length <= 1) { toast('至少保留一个类型'); return; }
						draftTypes.splice(idx, 1); renderTypes();
					};
					// 拖拽排序
					row.addEventListener('dragstart', e => { e.dataTransfer.setData('text/plain', idx); row.style.opacity = '0.4'; });
					row.addEventListener('dragend', () => { row.style.opacity = ''; });
					row.addEventListener('dragover', e => { e.preventDefault(); row.style.borderTop = '2px solid var(--accent)'; });
					row.addEventListener('dragleave', () => { row.style.borderTop = ''; });
					row.addEventListener('drop', e => {
						e.preventDefault(); row.style.borderTop = '';
						const fromIdx = parseInt(e.dataTransfer.getData('text/plain'));
						if (fromIdx !== idx && !isNaN(fromIdx)) {
							const [moved] = draftTypes.splice(fromIdx, 1);
							draftTypes.splice(idx, 0, moved);
							renderTypes();
						}
					});
					te.appendChild(row);
				});
			};
			renderTypes();
			panel.querySelector('#s-add-type').onclick = () => {
				draftTypes.push({ name: '新类型', single: false });
				renderTypes();
				panel.querySelector('#s-types-editor')?.lastChild?.scrollIntoView({ behavior: 'smooth' });
			};

			// 追剧状态管理
			const renderStatuses = () => {
				const se = panel.querySelector('#s-statuses'); if (!se) return; se.innerHTML = '';
				draft.statuses.forEach((st, idx) => {
					const row = document.createElement('div'); row.className = 'tag-row'; row.draggable = true; row.dataset.idx = idx;
					row.innerHTML = `
						<span style="cursor:grab;color:var(--muted);flex-shrink:0;font-size:14px;" title="拖拽排序">⠿</span>
						<div class="tag-color-dot" style="background:${st.color};width:9px;height:9px;border-radius:50%;flex-shrink:0;"></div>
						<input type="text"  value="${st.label}" placeholder="显示名称" class="flex-1">
						<input type="color" value="${st.color}">
						<button class="btn-icon" title="删除" style="color:#f87171;border-color:rgba(239,68,68,0.2);">${I.trash}</button>
					`;
					const inputs = row.querySelectorAll('input[type="text"], input[type="color"]');
					inputs[0].oninput = e => { draft.statuses[idx].label = e.target.value; };
					inputs[1].oninput = e => { draft.statuses[idx].color = e.target.value; row.querySelector('.tag-color-dot').style.background = e.target.value; };
					row.querySelector('.btn-icon').onclick = () => {
						if (draft.statuses.length <= 1) { toast('至少保留一个状态'); return; }
						draft.statuses.splice(idx, 1); renderStatuses();
					};
					// 拖拽排序
					row.addEventListener('dragstart', e => { e.dataTransfer.setData('text/plain', String(idx)); row.style.opacity = '0.4'; });
					row.addEventListener('dragend', () => { row.style.opacity = ''; });
					row.addEventListener('dragover', e => { e.preventDefault(); row.style.borderTop = '2px solid var(--accent)'; });
					row.addEventListener('dragleave', () => { row.style.borderTop = ''; });
					row.addEventListener('drop', e => {
						e.preventDefault(); row.style.borderTop = '';
						const fromIdx = parseInt(e.dataTransfer.getData('text/plain'));
						if (fromIdx !== idx && !isNaN(fromIdx)) {
							const [moved] = draft.statuses.splice(fromIdx, 1);
							draft.statuses.splice(idx, 0, moved);
							renderStatuses();
						}
					});
					se.appendChild(row);
				});
			};
			renderStatuses();
			panel.querySelector('#s-add-status').onclick = () => {
				draft.statuses.push({ id: 'custom_' + Date.now(), label: '新状态', color: '#a78bfa' });
				renderStatuses();
				panel.querySelector('#s-statuses')?.lastChild?.scrollIntoView({ behavior: 'smooth' });
			};

			// 平台分类管理
			const draftCategories = JSON.parse(JSON.stringify(state.platformCategories));
			const renderPlatformCats = () => {
				const ce = panel.querySelector('#s-platform-cats'); if (!ce) return; ce.innerHTML = '';
				draftCategories.forEach((cat, idx) => {
					const isMainstream = cat.id === 'mainstream';
					const useCustom = isMainstream && cat.customColor;
					const effectiveColor = useCustom ? cat.color : (isMainstream ? 'var(--accent)' : cat.color);
					const row = document.createElement('div'); row.className = 'tag-row'; row.draggable = true; row.dataset.idx = idx;
					row.innerHTML = `
						<span style="cursor:grab;color:var(--muted);flex-shrink:0;font-size:14px;" title="拖拽排序">⠿</span>
						<div class="tag-color-dot" style="background:${effectiveColor};width:9px;height:9px;border-radius:50%;flex-shrink:0;"></div>
						<input type="text"  value="${cat.name}"  placeholder="分类名称" class="flex-1">
						<input type="color" value="${cat.color}" ${isMainstream && !useCustom ? 'disabled style="opacity:0.4;cursor:not-allowed;flex-shrink:0;"' : 'style="flex-shrink:0;"'}>
						${isMainstream ? `<label style="display:flex;align-items:center;gap:3px;font-size:calc(var(--font-size)*0.714);color:var(--muted);cursor:pointer;white-space:nowrap;flex-shrink:0;"><input type="checkbox" class="cat-custom-cb" ${useCustom ? 'checked' : ''} style="width:13px;height:13px;"> 自定义</label>` : ''}
						<button class="btn-icon cat-del" title="删除" ${isMainstream ? 'disabled style="opacity:0.3;cursor:not-allowed;color:#f87171;border-color:rgba(239,68,68,0.2);"' : 'style="color:#f87171;border-color:rgba(239,68,68,0.2);"'}>${I.trash}</button>
					`;
					const nameInput = row.querySelector('input[type="text"]');
					const colorInput = row.querySelector('input[type="color"]');
					nameInput.oninput = e => { draftCategories[idx].name = e.target.value; };
					colorInput.oninput = e => { draftCategories[idx].color = e.target.value; row.querySelector('.tag-color-dot').style.background = e.target.value; };
					if (isMainstream) {
						const customCb = row.querySelector('.cat-custom-cb');
						customCb.onchange = () => { draftCategories[idx].customColor = customCb.checked; renderPlatformCats(); };
					}
					if (!isMainstream) {
						row.querySelector('.cat-del').onclick = () => {
							if (draftCategories.length <= 1) { toast('至少保留一个分类'); return; }
							draftCategories.splice(idx, 1); renderPlatformCats();
						};
					}
					// 拖拽排序
					row.addEventListener('dragstart', e => { e.dataTransfer.setData('text/plain', String(idx)); row.style.opacity = '0.4'; });
					row.addEventListener('dragend', () => { row.style.opacity = ''; });
					row.addEventListener('dragover', e => { e.preventDefault(); row.style.borderTop = '2px solid var(--accent)'; });
					row.addEventListener('dragleave', () => { row.style.borderTop = ''; });
					row.addEventListener('drop', e => {
						e.preventDefault(); row.style.borderTop = '';
						const fromIdx = parseInt(e.dataTransfer.getData('text/plain'));
						if (fromIdx !== idx && !isNaN(fromIdx)) {
							const [moved] = draftCategories.splice(fromIdx, 1);
							draftCategories.splice(idx, 0, moved);
							renderPlatformCats();
						}
					});
					ce.appendChild(row);
				});
			};
			renderPlatformCats();
			panel.querySelector('#s-add-platform-cat').onclick = () => {
				draftCategories.push({ id: 'cat_' + Date.now(), name: '新分类', color: '#8b5cf6' });
				renderPlatformCats();
				panel.querySelector('#s-platform-cats')?.lastChild?.scrollIntoView({ behavior: 'smooth' });
			};

			panel.querySelector('#s-export').onclick = () => App.exportData();
			panel.querySelector('#s-import').onclick = () => App.importData();

			// 取消：完整回滚到快照
			const cancelAndClose = () => {
				if (capturingHandler) { document.removeEventListener('keydown', capturingHandler, true); capturingHandler = null; }
				state.settings = savedSettingsSnap;
				ensureDefaults();
				App.applyTheme();
				if (state.settings.enableBall) App.mountBall();
				else if (App.ballEl) { App.ballEl.remove(); App.ballEl = null; }
				App.closeOverlay('settings');
			};
			panel.querySelector('#s-cancel').onclick = cancelAndClose;
			panel.querySelector('#s-close').onclick = cancelAndClose;

			// 保存
			panel.querySelector('#s-save').onclick = () => {
				if (capturingHandler) { document.removeEventListener('keydown', capturingHandler, true); capturingHandler = null; }
				const listMode = panel.querySelector('input[name="list-mode"]:checked')?.value || 'black';
				const domains = (panel.querySelector('#s-list-domains')?.value || '').split('\n').map(s => s.trim()).filter(Boolean);
				const finalHotkeys = { ...draft.hotkeys };
				const finalBallSize = parseInt(panel.querySelector('#s-ball-size').value) || 42;
				const finalBallOpacity = parseFloat(panel.querySelector('#s-ball-opacity').value);
				const finalFontSize = parseInt(panel.querySelector('#s-fontsize').value) || 16;
				const finalHeightAuto = panel.querySelector('#s-height-auto')?.checked ?? true;
				const finalHeightMin = parseInt(panel.querySelector('#s-height-min')?.value) || 400;
				const finalHeightMax = parseInt(panel.querySelector('#s-height-max')?.value) || 700;

				// 读取 tabOrder（当前 UI 顺序 + 显隐）
				const tabOrderItems = panel.querySelectorAll('#s-tab-order-list .tab-order-item');
				const fullTabOrder = [...new Set([...tabOrderItems].map(el => el.dataset.tab))];
				const enabledTabs = [...new Set([...tabOrderItems].filter(el => el.querySelector('.tab-order-cb')?.checked).map(el => el.dataset.tab))];
				const finalDefaultTab = panel.querySelector('#s-default-tab')?.value || 'records';

				Object.assign(state.settings, {
					theme: draft.theme,
					font: draft.font,
					listMode,
					blacklist: listMode === 'black' ? domains : [],
					whitelist: listMode === 'white' ? domains : [],
					enableBall: panel.querySelector('#s-ball').checked,
					clickMode: panel.querySelector('input[name="click-mode"]:checked')?.value || 'single-main',
					defaultTab: finalDefaultTab,
					tabOrder: fullTabOrder.length ? fullTabOrder : ['records', 'platforms', 'navlinks', 'notes'],
					enabledTabs: enabledTabs.length ? enabledTabs : ['records', 'platforms', 'navlinks', 'notes'],
					autoCleanTitle: panel.querySelector('#s-auto-clean').checked,
					enableReminder: panel.querySelector('#s-enable-reminder').checked,
					hotkeys: finalHotkeys,
					ui: { ...state.settings.ui, ...draft.ui, fontSize: finalFontSize, mainHeightAuto: finalHeightAuto, mainHeightMin: finalHeightMin, mainHeightMax: finalHeightMax },
					ball: { size: finalBallSize, bgOpacity: finalBallOpacity },
					cardStyle: panel.querySelector('input[name="card-style"]:checked')?.value || 'classic',
				});

				state.settings.dict.types = draftTypes.filter(t => t.name).map(t => ({ name: t.name, single: !!t.single }));
				if (!state.settings.dict.types.length) state.settings.dict.types = DEFAULT_TYPES.map(t => ({ ...t }));
				const validStatuses = draft.statuses.filter(s => s.id && s.label);
				state.settings.dict.statuses = validStatuses.length ? validStatuses : [...DEFAULT_STATUSES];

				const validCats = draftCategories.filter(c => c.id && c.name);
				state.platformCategories = validCats.length ? validCats : [...DEFAULT_PLATFORM_CATEGORIES];
				savePlatformCategories();

				state.settings._userThemeSelected = true;
				saveSettings();
				App.applyTheme();
				App.registerHotkeys();
				if (state.settings.enableBall) App.mountBall();
				else if (App.ballEl) { App.ballEl.remove(); App.ballEl = null; }
				App.closeOverlay('settings');

				// 若管理面板已打开，重新打开以应用新的 tab 配置
				if (App.overlays.main) {
					App.closeOverlay('main');
					App.openMain(false);
				}
				toast('设置已保存');
			};

			panel.querySelector('#s-reset').onclick = () => {
				const { ov: resetOv, panel: resetPanel } = this.makeOverlay('selective-reset', `
					<div class="panel-head">
						<div class="head-logo">${I.undo}</div>
						<h2>数据重置</h2>
						<button class="btn-icon" id="sr-close">${I.x}</button>
					</div>
					<div class="panel-body pad-lg" >
						<p style="font-size:calc(var(--font-size)*0.929);color:var(--text);margin-bottom:14px;">选择要重置的数据模块（勾选的将被清除）：</p>
						<div class="stack">
							<label class="cb-row"><input type="checkbox" id="sr-settings" checked> 自定义设置（主题、字体、外观布局、悬浮球等）</label>
							<label class="cb-row"><input type="checkbox" id="sr-webdav" checked> WebDAV 配置（服务器地址、用户名、密码）</label>
							<label class="cb-row"><input type="checkbox" id="sr-shows" checked> 观影记录（${state.shows.length} 部剧集）</label>
							<label class="cb-row"><input type="checkbox" id="sr-platforms" checked> 观影平台（${state.platforms.length} 个平台）</label>
							<label class="cb-row"><input type="checkbox" id="sr-nav" checked> 网页导航（${state.navLinks.length} 个网页）</label>
							<label class="cb-row"><input type="checkbox" id="sr-notes" checked> 笔记（${state.notes.length} 篇笔记）</label>
							<label class="cb-row"><input type="checkbox" id="sr-timer" checked> 计时器/日历</label>
						</div>
					</div>
					<div class="panel-foot">
						<button class="btn btn-ghost" id="sr-cancel">取消</button>
						<button class="btn btn-danger ml-auto" id="sr-confirm">${I.undo} 确认重置</button>
					</div>
				`, { panelClass: ' edit-panel' });

				const close = () => this.closeOverlay('selective-reset');
				resetPanel.querySelector('#sr-close').onclick = close;
				resetPanel.querySelector('#sr-cancel').onclick = close;
				resetPanel.querySelector('#sr-confirm').onclick = () => {
					const items = [];
					if (resetPanel.querySelector('#sr-settings').checked) { GM_setValue(KEY_SETTINGS, null); items.push('设置'); }
					if (resetPanel.querySelector('#sr-webdav').checked) { GM_setValue(KEY_WEBDAV, null); items.push('WebDAV'); }
					if (resetPanel.querySelector('#sr-shows').checked) { GM_setValue(KEY_DATA, []); items.push('观影记录'); }
					if (resetPanel.querySelector('#sr-platforms').checked) { GM_setValue(KEY_PLATFORMS, null); GM_setValue(KEY_PLATFORM_CATS, null); items.push('观影平台'); }
					if (resetPanel.querySelector('#sr-nav').checked) { GM_setValue(KEY_NAV_CATS, null); GM_setValue(KEY_NAV_LINKS, null); GM_setValue(KEY_NAV_ENGINES, null); items.push('网页导航'); }
					if (resetPanel.querySelector('#sr-notes').checked) { GM_setValue(KEY_NOTES, null); items.push('笔记'); }
				if (resetPanel.querySelector('#sr-timer').checked) { GM_setValue(KEY_TIMER, null); GM_setValue(KEY_TODOS, null); GM_setValue(KEY_MARKS, null); items.push('计时器/日历/待办'); }
					if (!items.length) { toast('请至少选择一项'); return; }
					if (!confirm(`将重置以下模块：${items.join('、')}\n\n此操作不可恢复，确定？`)) return;
					close();
					location.reload();
				};
			};

			// ----- WebDAV 配置加载与事件绑定 -----
			const webdavCfg = getWebDAVConfig();
			const serverInput = panel.querySelector('#webdav-server');
			const usernameInput = panel.querySelector('#webdav-username');
			const passwordInput = panel.querySelector('#webdav-password');
			const filenameInput = panel.querySelector('#webdav-filename');
			const statusSpan = panel.querySelector('#webdav-status-text');

			if (serverInput) serverInput.value = webdavCfg.server;
			if (usernameInput) usernameInput.value = webdavCfg.username;
			if (passwordInput) passwordInput.value = webdavCfg.password;
			if (filenameInput) filenameInput.value = webdavCfg.filename;

			// 初始化状态指示器
			const statusDot = panel.querySelector('#webdav-status-dot');
			if (statusSpan) {
				const isConfigured = webdavCfg.server && webdavCfg.username && webdavCfg.password;
				if (!isConfigured) {
					statusSpan.textContent = '尚未配置';
					if (statusDot) statusDot.style.background = 'var(--muted)';
				} else if (webdavCfg.lastSyncTime) {
					statusSpan.textContent = `上次同步：${new Date(webdavCfg.lastSyncTime).toLocaleString()}`;
					if (statusDot) statusDot.style.background = '#4ade80';
				} else {
					statusSpan.textContent = '已配置，未同步';
					if (statusDot) statusDot.style.background = '#fbbf24';
				}
			}

			// 保存配置
			const saveWebDAVBtn = panel.querySelector('#webdav-save');
			if (saveWebDAVBtn) {
				saveWebDAVBtn.onclick = () => {
					let server = serverInput.value.trim();
					if (server && !server.endsWith('/')) server += '/';
					const newCfg = {
						server: server,
						username: usernameInput.value.trim(),
						password: passwordInput.value,
						filename: filenameInput.value.trim() || 'omni-trail_backup.json',
						syncOption: 'ask',
						lastSyncTime: webdavCfg.lastSyncTime,
					};
					saveWebDAVConfig(newCfg);
					toast('WebDAV 配置已保存');
					const dot = panel.querySelector('#webdav-status-dot');
					if (statusSpan) {
						if (newCfg.server && newCfg.username && newCfg.password) {
							statusSpan.textContent = newCfg.lastSyncTime ? `上次同步：${new Date(newCfg.lastSyncTime).toLocaleString()}` : '已配置，未同步';
							if (dot) dot.style.background = '#fbbf24';
						} else {
							statusSpan.textContent = '尚未配置';
							if (dot) dot.style.background = 'var(--muted)';
						}
					}
				};
			}

			// 测试连接
			const testBtn = panel.querySelector('#webdav-test');
			if (testBtn) {
				testBtn.onclick = async () => {
					const cfg = {
						server: serverInput.value.trim(),
						username: usernameInput.value.trim(),
						password: passwordInput.value,
						filename: filenameInput.value.trim() || 'omni-trail_backup.json',
					};
					if (!cfg.server || !cfg.username || !cfg.password) {
						toast('请填写完整的服务器地址、用户名和密码');
						return;
					}
					toast('正在测试连接...');
					const result = await testWebDAVConnection(cfg);
					const dot = panel.querySelector('#webdav-status-dot');
					if (result.success) {
						toast(result.message);
						if (statusSpan) statusSpan.textContent = result.message;
						if (dot) dot.style.background = '#4ade80';
					} else {
						toast(result.message, 4000);
						if (statusSpan) statusSpan.textContent = result.message;
						if (dot) dot.style.background = '#f87171';
					}
				};
			}

			const togglePwdBtn = panel.querySelector('#toggle-password-visibility');
			const pwdInput = panel.querySelector('#webdav-password');
			if (togglePwdBtn && pwdInput) {
				togglePwdBtn.onclick = () => {
					const isHidden = pwdInput.getAttribute('type') === 'password';
					pwdInput.setAttribute('type', isHidden ? 'text' : 'password');
					togglePwdBtn.innerHTML = isHidden ? I.eyeOff : I.eye;
				};
			}

			// 上传
			const uploadBtn = panel.querySelector('#webdav-upload');
			if (uploadBtn) {
				uploadBtn.onclick = () => App.backupToCloud();
			}

			// 下载
			const downloadBtn = panel.querySelector('#webdav-download');
			if (downloadBtn) {
				downloadBtn.onclick = () => App.restoreFromCloud();
			}
		},

		// ── 快捷键注册 ──
		registerHotkeys() {
			if (this.hotkeyListener) document.removeEventListener('keydown', this.hotkeyListener);
			const parseCombo = (combo) => {
				if (!combo) return null;
				const parts = combo.split('+');
				const mods = { ctrl: parts.includes('Ctrl'), alt: parts.includes('Alt'), shift: parts.includes('Shift'), meta: parts.includes('Meta') };
				const key = parts.find(p => !['Ctrl', 'Alt', 'Shift', 'Meta'].includes(p));
				return { mods, key: key ? key.toLowerCase() : null };
			};
			this.hotkeyListener = (e) => {
				const tag = document.activeElement?.tagName;
				if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
				const check = (combo, action) => {
					if (!combo) return; // 支持留空：无快捷键直接跳过
					const c = parseCombo(combo); if (!c || !c.key) return;
					if (c.mods.alt === e.altKey && c.mods.ctrl === e.ctrlKey && c.mods.shift === e.shiftKey && c.mods.meta === e.metaKey && e.key.toLowerCase() === c.key) {
						e.preventDefault(); action();
					}
				};
				check(state.settings.hotkeys.main, () => this.openMain());
				check(state.settings.hotkeys.openRecords, () => this.openMain(true, 'records'));
				check(state.settings.hotkeys.record, () => this.openRecord());
				check(state.settings.hotkeys.platforms, () => this.openMain(true, 'platforms'));
				check(state.settings.hotkeys.navlinks, () => this.openMain(true, 'navlinks'));
				check(state.settings.hotkeys.notes, () => this.openMain(true, 'notes'));
				check(state.settings.hotkeys.timer, () => this.openMain(true, 'timer'));
			};
			document.addEventListener('keydown', this.hotkeyListener);
		},

		// 导出备份 — 多选数据范围
		exportData() { this.showExportDialog(); },
		showExportDialog() {
			const { ov, panel } = this.makeOverlay('export-dialog', `
				<div class="panel-head">
					<div class="head-logo">${I.upload}</div>
					<h2>导出备份</h2>
					<button class="btn-icon" id="exp-close">${I.x}</button>
				</div>
				<div class="panel-body pad-lg" >
					<p style="font-size:calc(var(--font-size) * 0.929);color:var(--text);margin-bottom:14px;">选择要导出的数据范围：</p>
					<div class="stack">
						<label class="cb-row"><input type="checkbox" id="exp-settings" checked> 主题与设置（主题、字体、快捷键、悬浮球等）</label>
						<label class="cb-row"><input type="checkbox" id="exp-shows" checked> 观看记录（${state.shows.length} 部剧集）</label>
						<label class="cb-row"><input type="checkbox" id="exp-platforms" checked> 观影平台（${state.platforms.length} 个平台）</label>
						<label class="cb-row"><input type="checkbox" id="exp-nav" checked> 网页导航（${state.navLinks.length} 个网页）</label>
					<label class="cb-row"><input type="checkbox" id="exp-notes" checked> 笔记（${state.notes.length} 篇）</label>
					<label class="cb-row"><input type="checkbox" id="exp-todos" checked> 待办事项（${Object.values(state.todos).reduce((s,a) => s + a.length, 0)} 条）</label>
					<label class="cb-row"><input type="checkbox" id="exp-marks" checked> 日期标注（${Object.values(state.marks).reduce((s,a) => s + a.length, 0)} 条）</label>
					</div>
				</div>
				<div class="panel-foot">
					<button class="btn btn-ghost" id="exp-cancel">取消</button>
					<button class="btn btn-primary ml-auto" id="exp-do">${I.upload} 导出</button>
				</div>
			`, { panelClass: ' edit-panel' });

			const close = () => this.closeOverlay('export-dialog');
			panel.querySelector('#exp-close').onclick = close;
			panel.querySelector('#exp-cancel').onclick = close;
			panel.querySelector('#exp-do').onclick = () => {
				const opts = {
					settings: panel.querySelector('#exp-settings').checked,
					shows: panel.querySelector('#exp-shows').checked,
					platforms: panel.querySelector('#exp-platforms').checked,
					nav: panel.querySelector('#exp-nav').checked,
					notes: panel.querySelector('#exp-notes').checked,
					todos: panel.querySelector('#exp-todos')?.checked || false,
					marks: panel.querySelector('#exp-marks')?.checked || false,
				};
				if (!opts.settings && !opts.shows && !opts.platforms && !opts.nav && !opts.notes && !opts.todos && !opts.marks) { toast('请至少选择一项'); return; }
				const dump = buildDump(opts);
				const blob = new Blob([JSON.stringify(dump, null, 2)], { type: 'application/json' });
				const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
				a.download = `Omni_Trail_备份_${new Date().toISOString().slice(0, 10)}.json`; a.click(); URL.revokeObjectURL(a.href);
				close(); toast('备份已下载');
			};
		},

		// ── WebDAV 备份与恢复──
		async backupToCloud() {
			const cfg = getWebDAVConfig();
			if (!cfg.server || !cfg.username || !cfg.password) {
				if (confirm('未检测到 WebDAV 配置，是否前往设置页面完成配置？')) {
					this.openSettings('webdav');
				}
				return;
			}
			toast('正在上传数据到云端...');
			try {
				const dump = buildDump({ settings: true, shows: true, platforms: true, nav: true, notes: true, timer: true, todos: true, marks: true });
				await uploadToWebDAV(cfg, dump);
				updateWebDAVSyncTime();
				toast('✅ 已备份当前数据至云');
			} catch (err) {
				toast(`上传失败：${err.message}`, 4000);
			}
		},

		async restoreFromCloud() {
			const cfg = getWebDAVConfig();
			if (!cfg.server || !cfg.username || !cfg.password) {
				if (confirm('未检测到 WebDAV 配置，是否前往设置页面完成配置？')) {
					this.openSettings('webdav');
				}
				return;
			}
			toast('正在从云端下载...');
			try {
				const imported = await downloadFromWebDAV(cfg);
				this.showImportDialog(imported, true);
			} catch (err) {
				toast(`下载失败：${err.message}`, 4000);
			}
		},

		mergeData(imported, opts) {
			// opts: { settings, shows, platforms, nav } 或旧版 boolean
			if (typeof opts === 'boolean') opts = { settings: opts, shows: true, platforms: true, nav: true };
			opts = opts || { settings: false, shows: true, platforms: true, nav: true };
			if (opts.shows !== false && imported.shows && imported.shows.length) {
				imported.shows.forEach(incoming => {
					const existing = state.shows.find(s => s.name === incoming.name && s.type === incoming.type);
					if (existing) {
						existing.currentEpisode = Math.max(existing.currentEpisode || 0, incoming.currentEpisode || 0);
						if (incoming.latestEpisode != null && (existing.latestEpisode == null || incoming.latestEpisode > existing.latestEpisode)) existing.latestEpisode = incoming.latestEpisode;
						if (incoming.links && incoming.links.length) incoming.links.forEach(link => { if (link.url) mergeShowLinks(existing, link.url, link.episode); });
						if ((incoming.rating || 0) > (existing.rating || 0)) existing.rating = incoming.rating;
						if (incoming.coverUrl && !incoming.coverUrl.startsWith('data:') && (!existing.coverUrl || existing.coverUrl.startsWith('data:'))) existing.coverUrl = incoming.coverUrl;
						if (incoming.notes && (!existing.notes || !existing.notes.includes(incoming.notes))) existing.notes = existing.notes ? existing.notes + '\n' + incoming.notes : incoming.notes;
						existing.updatedAt = Date.now();
					} else {
						state.shows.push({ ...incoming });
					}
				});
			}
			if (opts.platforms !== false && imported.platforms && imported.platforms.length) {
				imported.platforms.forEach(plat => {
					if (!state.platforms.find(p => p.id === plat.id || (p.name === plat.name && getPlatformUrl(p) === getPlatformUrl(plat)))) state.platforms.push({ ...plat });
				});
			}
			if (opts.platforms !== false && imported.platformCategories && imported.platformCategories.length) {
				imported.platformCategories.forEach(cat => {
					if (!state.platformCategories.find(c => c.id === cat.id)) state.platformCategories.push({ ...cat });
				});
			}
			if (opts.settings && imported.settings) {
				state.settings = deepMerge(state.settings, imported.settings);
			}
			if (opts.nav !== false && imported.navLinks && imported.navLinks.length) {
				imported.navLinks.forEach(link => {
					if (!state.navLinks.find(l => l.id === link.id || (l.title === link.title && l.url === link.url))) state.navLinks.push({ ...link });
				});
			}
			if (opts.nav !== false && imported.navCategories && imported.navCategories.length) {
				imported.navCategories.forEach(cat => {
					if (!state.navCategories.find(c => c.id === cat.id)) state.navCategories.push({ ...cat });
				});
			}
			if (opts.nav !== false && imported.navEngines && imported.navEngines.length) {
				imported.navEngines.forEach(eng => {
					if (!state.navEngines.find(e => e.id === eng.id)) state.navEngines.push({ ...eng });
				});
			}
			if (opts.notes !== false && imported.notes && imported.notes.length) {
				imported.notes.forEach(note => {
					if (!state.notes.find(n => n.id === note.id || (n.title === note.title && n.content === note.content))) state.notes.push({ ...note });
				});
			}
			if (opts.timer !== false && imported.timer) {
				state.timer = deepMerge(state.timer, imported.timer);
			}
		},

		// ── 导入 ──
		importData() {
			const inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.json';
			inp.onchange = e => {
				const file = e.target.files[0]; if (!file) return;
				const reader = new FileReader();
				reader.onload = ev => {
					try {
						const imported = JSON.parse(ev.target.result);
						if (Array.isArray(imported)) {
							this.showImportDialog({ shows: imported, settings: null, platforms: null, platformCategories: null, navCategories: null, navLinks: null, navEngines: null });
						} else if (imported.shows || imported._version) {
							this.showImportDialog({
								shows: imported.shows || [],
								settings: imported.settings || null,
								platforms: imported.platforms || null,
								platformCategories: imported.platformCategories || null,
								navCategories: imported.navCategories || null,
								navLinks: imported.navLinks || null,
								navEngines: imported.navEngines || null,
								notes: imported.notes || null,
								timer: imported.timer || null,
								todos: imported.todos || null,
								marks: imported.marks || null,
							});
						} else if (imported.categories && imported.links) {
							// 网页导航页导出格式（nav_cloud JSON）
							this.showImportDialog({
								shows: null, settings: null, platforms: null, platformCategories: null,
								navCategories: imported.categories || null,
								navLinks: imported.links || null,
								navEngines: imported.engines || null,
							});
						} else {
							toast('文件格式不正确，缺少有效数据');
						}
					} catch (err) { console.error('导入数据解析失败:', err); toast(`文件解析失败: ${err.message || '请检查格式'}`); }
				};
				reader.readAsText(file);
			};
			inp.click();
		},

		showImportDialog(imported, isCloudRestore = false) {
			const showCount = imported.shows ? imported.shows.length : 0;
			const platCount = imported.platforms ? imported.platforms.length : 0;
			const catCount = imported.platformCategories ? imported.platformCategories.length : 0;
			const navLinkCount = imported.navLinks ? imported.navLinks.length : 0;
			const notesCount = imported.notes ? imported.notes.length : 0;
			const todosCount = imported.todos ? Object.values(imported.todos).reduce((s, a) => s + a.length, 0) : 0;
			const marksCount = imported.marks ? Object.values(imported.marks).reduce((s, a) => s + a.length, 0) : 0;
			const hasTimer = !!imported.timer;
			const hasSettings = !!imported.settings;

			// 云端恢复时显示云端数据的时间戳（若有）
			const cloudInfo = isCloudRestore && imported._date
				? `<p style="font-size:calc(var(--font-size) * 0.786);color:var(--muted);margin:8px 0;">
                    备份时间：<strong>${new Date(imported._date).toLocaleString()}</strong>
                </p>`
				: '';

			const title = isCloudRestore ? '从云端恢复数据' : '导入数据';
			const description = isCloudRestore
				? `<p style="font-size:calc(var(--font-size) * 0.929);color:var(--text);margin-bottom:12px;">
                    云端数据包含：<strong>${showCount}</strong> 部剧集
                    ${platCount > 0 ? `、<strong>${platCount}</strong> 个平台` : ''}
                    ${catCount > 0 ? `、<strong>${catCount}</strong> 个分类` : ''}
                    ${navLinkCount > 0 ? `、<strong>${navLinkCount}</strong> 个网页` : ''}
                    ${notesCount > 0 ? `、<strong>${notesCount}</strong> 篇笔记` : ''}
                    ${todosCount > 0 ? `、<strong>${todosCount}</strong> 条待办` : ''}
                    ${marksCount > 0 ? `、<strong>${marksCount}</strong> 条标注` : ''}
                </p>
                ${cloudInfo}`
				: `<p style="font-size:calc(var(--font-size) * 0.929);color:var(--text);margin-bottom:12px;">
                    文件包含：<strong>${showCount}</strong> 部剧集
                    ${platCount > 0 ? `、<strong>${platCount}</strong> 个平台` : ''}
                    ${catCount > 0 ? `、<strong>${catCount}</strong> 个分类` : ''}
                    ${navLinkCount > 0 ? `、<strong>${navLinkCount}</strong> 个网页` : ''}
                    ${notesCount > 0 ? `、<strong>${notesCount}</strong> 篇笔记` : ''}
                    ${todosCount > 0 ? `、<strong>${todosCount}</strong> 条待办` : ''}
                    ${marksCount > 0 ? `、<strong>${marksCount}</strong> 条标注` : ''}
                </p>`;

			const { ov, panel } = this.makeOverlay('import-dialog', `
                <div class="panel-head">
                    <div class="head-logo">${isCloudRestore ? I.cloudDownload : I.download}</div>
                    <h2>${title}</h2>
                    <button class="btn-icon" id="imp-close">${I.x}</button>
                </div>
                <div class="panel-body pad-lg" >
                    ${description}
                    <p style="font-size:calc(var(--font-size) * 0.857);color:var(--muted);margin-bottom:10px;">选择要导入的数据范围：</p>
                    <div class="stack">
                        ${hasSettings ? `<label class="cb-row"><input type="checkbox" id="imp-include-settings" checked> 主题与设置（主题、字体、快捷键等）</label>` : ''}
                        ${showCount > 0 ? `<label class="cb-row"><input type="checkbox" id="imp-include-shows" checked> 观看记录（${showCount} 部剧集）</label>` : ''}
                        ${platCount > 0 ? `<label class="cb-row"><input type="checkbox" id="imp-include-platforms" checked> 观影平台（${platCount} 个平台）</label>` : ''}
                        ${navLinkCount > 0 ? `<label class="cb-row"><input type="checkbox" id="imp-include-nav" checked> 网页导航（${navLinkCount} 个网页）</label>` : ''}
                        ${notesCount > 0 ? `<label class="cb-row"><input type="checkbox" id="imp-include-notes" checked> 笔记（${notesCount} 篇）</label>` : ''}
                        ${(imported.todos && Object.keys(imported.todos).length > 0) ? `<label class="cb-row"><input type="checkbox" id="imp-include-todos" checked> 待办事项（${Object.values(imported.todos).reduce((s,a) => s + a.length, 0)} 条）</label>` : ''}
                        ${(imported.marks && Object.keys(imported.marks).length > 0) ? `<label class="cb-row"><input type="checkbox" id="imp-include-marks" checked> 日期标注（${Object.values(imported.marks).reduce((s,a) => s + a.length, 0)} 条）</label>` : ''}
                    </div>
                    <div style="display:flex;gap:10px;justify-content:center;margin:16px 0 8px;">
                        <button class="btn btn-primary btn-full" id="imp-overwrite" >覆盖现有数据</button>
                        <button class="btn btn-primary btn-full" id="imp-merge"     >合并到当前数据</button>
                    </div>
                    <button class="btn btn-ghost" id="imp-cancel" style="width:100%;justify-content:center;">取消</button>
                </div>
            `, { panelClass: ' edit-panel' });

			const getIncludeSettings = () => hasSettings && (panel.querySelector('#imp-include-settings')?.checked ?? true);
			const getIncludeShows = () => showCount > 0 && (panel.querySelector('#imp-include-shows')?.checked ?? true);
			const getIncludePlatforms = () => platCount > 0 && (panel.querySelector('#imp-include-platforms')?.checked ?? true);
			const getIncludeNav = () => navLinkCount > 0 && (panel.querySelector('#imp-include-nav')?.checked ?? true);
			const getIncludeNotes = () => notesCount > 0 && (panel.querySelector('#imp-include-notes')?.checked ?? true);
			const getIncludeTodos = () => imported.todos && Object.keys(imported.todos).length > 0 && (panel.querySelector('#imp-include-todos')?.checked ?? true);
			const getIncludeMarks = () => imported.marks && Object.keys(imported.marks).length > 0 && (panel.querySelector('#imp-include-marks')?.checked ?? true);

			panel.querySelector('#imp-close').onclick = () => this.closeOverlay('import-dialog');
			panel.querySelector('#imp-cancel').onclick = () => this.closeOverlay('import-dialog');

			panel.querySelector('#imp-overwrite').onclick = () => {
				if (!confirm('⚠️ 覆盖会丢失所选范围的当前数据，确定吗？')) return;
				const snap = {
					shows: JSON.parse(JSON.stringify(state.shows)),
					platforms: JSON.parse(JSON.stringify(state.platforms)),
					platformCategories: JSON.parse(JSON.stringify(state.platformCategories)),
					navCategories: JSON.parse(JSON.stringify(state.navCategories)),
					navLinks: JSON.parse(JSON.stringify(state.navLinks)),
					navEngines: JSON.parse(JSON.stringify(state.navEngines)),
					notes: JSON.parse(JSON.stringify(state.notes)),
					settings: JSON.parse(JSON.stringify(state.settings)),
					todos: JSON.parse(JSON.stringify(state.todos)),
					marks: JSON.parse(JSON.stringify(state.marks)),
				};
				if (getIncludeShows() && imported.shows) state.shows = imported.shows;
				if (getIncludePlatforms() && imported.platforms) state.platforms = imported.platforms;
				if (getIncludePlatforms() && imported.platformCategories) state.platformCategories = imported.platformCategories;
				if (getIncludeNav() && imported.navCategories) state.navCategories = imported.navCategories;
				if (getIncludeNav() && imported.navLinks) state.navLinks = imported.navLinks;
				if (getIncludeNav() && imported.navEngines) state.navEngines = imported.navEngines;
				if (getIncludeNotes() && imported.notes) state.notes = imported.notes;
				if (getIncludeTodos() && imported.todos) state.todos = imported.todos;
				if (getIncludeMarks() && imported.marks) state.marks = imported.marks;
				if (getIncludeSettings() && imported.settings) state.settings = deepMerge(DEFAULT_SETTINGS, imported.settings);
				ensureDefaults(); saveData(); saveSettings(); savePlatforms(); savePlatformCategories(); saveNavCategories(); saveNavLinks(); saveNavEngines(); saveNotes(); saveTimer(); saveTodos(); saveMarks();
				this.applyTheme(); this.renderShows();
				const mainPanel = this.overlays.main?.querySelector('.panel');
				if (mainPanel) { this.renderPlatforms(mainPanel); this.renderNavCategories(mainPanel); this.renderNavLinks(mainPanel); }
				this.closeOverlay('import-dialog');
				if (isCloudRestore) updateWebDAVSyncTime();
				if (isCloudRestore) {
					showUndoToast('已从云端恢复数据（覆盖）', () => {
						state.shows = snap.shows;
						state.platforms = snap.platforms;
						state.platformCategories = snap.platformCategories;
						state.navCategories = snap.navCategories;
						state.navLinks = snap.navLinks;
						state.navEngines = snap.navEngines;
						state.notes = snap.notes;
						state.todos = snap.todos;
						state.marks = snap.marks;
						state.settings = deepMerge(DEFAULT_SETTINGS, snap.settings);
						ensureDefaults(); saveData(); saveSettings(); savePlatforms(); savePlatformCategories(); saveNavCategories(); saveNavLinks(); saveNavEngines(); saveNotes(); saveTodos(); saveMarks();
						this.applyTheme(); this.renderShows();
						const mainPanel = this.overlays.main?.querySelector('.panel');
						if (mainPanel) { this.renderPlatforms(mainPanel); this.renderNavCategories(mainPanel); this.renderNavLinks(mainPanel); }
						toast('已撤销云端恢复');
					});
				} else {
					toast('数据已覆盖');
				}
			};

			panel.querySelector('#imp-merge').onclick = () => {
				const snap = {
					shows: JSON.parse(JSON.stringify(state.shows)),
					platforms: JSON.parse(JSON.stringify(state.platforms)),
					platformCategories: JSON.parse(JSON.stringify(state.platformCategories)),
					navCategories: JSON.parse(JSON.stringify(state.navCategories)),
					navLinks: JSON.parse(JSON.stringify(state.navLinks)),
					navEngines: JSON.parse(JSON.stringify(state.navEngines)),
					notes: JSON.parse(JSON.stringify(state.notes)),
					settings: JSON.parse(JSON.stringify(state.settings)),
					todos: JSON.parse(JSON.stringify(state.todos)),
					marks: JSON.parse(JSON.stringify(state.marks)),
				};
				const mergeOpts = { settings: getIncludeSettings(), shows: getIncludeShows(), platforms: getIncludePlatforms(), nav: getIncludeNav(), notes: getIncludeNotes() };
				this.mergeData(imported, mergeOpts);
				// 合并待办和标注
				if (getIncludeTodos() && imported.todos) {
					Object.entries(imported.todos).forEach(([k, v]) => {
						if (!state.todos[k]) state.todos[k] = v;
						else { const ids = new Set(state.todos[k].map(t => t.id)); v.forEach(t => { if (!ids.has(t.id)) state.todos[k].push(t); }); }
					});
				}
				if (getIncludeMarks() && imported.marks) {
					Object.entries(imported.marks).forEach(([k, v]) => {
						if (!state.marks[k]) state.marks[k] = v;
						else { const ids = new Set(state.marks[k].map(t => t.id)); v.forEach(t => { if (!ids.has(t.id)) state.marks[k].push(t); }); }
					});
				}
				ensureDefaults(); saveData(); saveSettings(); savePlatforms(); savePlatformCategories(); saveNavCategories(); saveNavLinks(); saveNavEngines(); saveNotes(); saveTodos(); saveMarks();
				this.applyTheme(); this.renderShows();
				const mainPanel = this.overlays.main?.querySelector('.panel');
				if (mainPanel) { this.renderPlatforms(mainPanel); this.renderNavCategories(mainPanel); this.renderNavLinks(mainPanel); }
				this.closeOverlay('import-dialog');
				if (isCloudRestore) updateWebDAVSyncTime();
				if (isCloudRestore) {
					showUndoToast('已从云端恢复数据（合并）', () => {
						state.shows = snap.shows;
						state.platforms = snap.platforms;
						state.platformCategories = snap.platformCategories;
						state.navCategories = snap.navCategories;
						state.navLinks = snap.navLinks;
						state.navEngines = snap.navEngines;
						state.notes = snap.notes;
						state.todos = snap.todos;
						state.marks = snap.marks;
						state.settings = deepMerge(DEFAULT_SETTINGS, snap.settings);
						ensureDefaults(); saveData(); saveSettings(); savePlatforms(); savePlatformCategories(); saveNavCategories(); saveNavLinks(); saveNavEngines(); saveNotes(); saveTodos(); saveMarks();
						this.applyTheme(); this.renderShows();
						const mainPanel = this.overlays.main?.querySelector('.panel');
						if (mainPanel) { this.renderPlatforms(mainPanel); this.renderNavCategories(mainPanel); this.renderNavLinks(mainPanel); }
						toast('已撤销云端恢复');
					});
				} else {
					toast('数据已合并');
				}
			};
		},

		// ── 跨标签页同步 ──
		syncListener() {
			GM_addValueChangeListener(KEY_DATA, (name, oldV, newV, remote) => {
				if (remote) { state.shows = newV || []; this.renderShows(); toast('其他标签页已更新剧集数据'); }
			});
			GM_addValueChangeListener(KEY_SETTINGS, (name, oldV, newV, remote) => {
				if (remote && newV) {
					state.settings = deepMerge(DEFAULT_SETTINGS, newV); ensureDefaults();
					this.applyTheme(); this.registerHotkeys();
					if (state.settings.enableBall && !this.ballEl) this.mountBall();
					else if (!state.settings.enableBall && this.ballEl) { this.ballEl.remove(); this.ballEl = null; }
					else if (state.settings.enableBall && this.ballEl) this.mountBall();
					toast('其他标签页已更改设置');
				}
			});
			GM_addValueChangeListener(KEY_PLATFORMS, (name, oldV, newV, remote) => {
				if (remote && newV) {
					state.platforms = newV;
					if (this.overlays.main) {
						const panel = this.overlays.main.querySelector('.panel');
						if (panel?.querySelector('#platforms-container')) this.renderPlatforms(panel);
					}
					toast('其他标签页已更新平台列表');
				}
			});
			GM_addValueChangeListener(KEY_PLATFORM_CATS, (name, oldV, newV, remote) => {
				if (remote && newV) { state.platformCategories = newV; toast('其他标签页已更新平台分类'); }
			});
			GM_addValueChangeListener(KEY_NAV_CATS, (name, oldV, newV, remote) => {
				if (remote && newV) {
					state.navCategories = newV;
					const mainPanel = this.overlays.main?.querySelector('.panel');
					if (mainPanel) { this.renderNavCategories(mainPanel); this.renderNavLinks(mainPanel); }
				}
			});
			GM_addValueChangeListener(KEY_NAV_LINKS, (name, oldV, newV, remote) => {
				if (remote && newV) {
					state.navLinks = newV;
					const mainPanel = this.overlays.main?.querySelector('.panel');
					if (mainPanel) this.renderNavLinks(mainPanel);
				}
			});
			GM_addValueChangeListener(KEY_NAV_ENGINES, (name, oldV, newV, remote) => {
				if (remote && newV) {
					state.navEngines = newV;
					const mainPanel = this.overlays.main?.querySelector('.panel');
					if (mainPanel) this.renderNavEngines(mainPanel);
				}
			});
			GM_addValueChangeListener(KEY_NOTES, (name, oldV, newV, remote) => {
				if (remote && newV) {
					state.notes = newV;
					const mainPanel = this.overlays.main?.querySelector('.panel');
					if (mainPanel) this.renderNotesList(mainPanel);
				}
			});
			GM_addValueChangeListener(KEY_TIMER, (name, oldV, newV, remote) => {
				if (remote && newV) {
					state.timer = deepMerge(DEFAULT_TIMER, newV);
					// 若番茄钟/倒计时在其他标签页被结束，显示通知
					if (oldV) {
						if (oldV.pomodoro?.running && !newV.pomodoro?.running && newV.pomodoro?.phase === 'work') {
							toast('其他标签页已完成一个番茄钟');
						}
						if (oldV.countdown?.targetTs > 0 && !newV.countdown?.targetTs) {
							toast('其他标签页倒计时已结束');
						}
					}
				}
			});
			GM_addValueChangeListener(KEY_TODOS, (name, oldV, newV, remote) => {
				if (remote && newV) {
					state.todos = newV;
					const calPanel = this.overlays.main?.querySelector('.cal-right');
					if (calPanel) { const mainPanel = this.overlays.main?.querySelector('.panel'); if (mainPanel) { const cal = TAB_REGISTRY.calendar; if (cal) cal._renderTodos(mainPanel); } }
				}
			});
			GM_addValueChangeListener(KEY_MARKS, (name, oldV, newV, remote) => {
				if (remote && newV) {
					state.marks = newV;
					const mainPanel = this.overlays.main?.querySelector('.panel');
					if (mainPanel) { const cal = TAB_REGISTRY.calendar; if (cal) { cal._renderTodos(mainPanel); cal._renderCalendar(mainPanel); } }
				}
			});
		},

		bindGlobal() {
			document.addEventListener('keydown', e => {
				if (e.key === 'Escape') {
					if (this._mainPinned && this.overlays.main) {
						// 置顶时只关闭非主面板的 overlay
						Object.keys(this.overlays).forEach(id => { if (id !== 'main') this.closeOverlay(id); });
					} else {
						this.closeAll();
					}
					this.closeTunerBar();
				}
			});
		},

		// ── SPA 路由监听 ──
		watchRouteChanges() {
			let lastUrl = location.href;
			let lastEpisode = 0;

			// 初始化：记录当前页面的集数
			try {
				const init = extractFromPage();
				lastEpisode = init.episodeCandidates?.[0] || 0;
			} catch { }

			const checkAndRecord = () => {
				if (location.href === lastUrl) return;
				lastUrl = location.href;

				// 延迟等待 SPA 框架完成 DOM 更新
				setTimeout(() => {
					try {
						const data = extractFromPage();
						const newEp = data.episodeCandidates?.[0] || 0;
						if (!newEp || newEp === lastEpisode) return;

						// 查找匹配的已有剧集
						const cleanName = state.settings.autoCleanTitle ? cleanTitle(data.name) : data.name;
						const existing = state.shows.find(s => {
							if (s.name !== cleanName) return false;
							if (data.type && s.type !== data.type) return false;
							return true;
						});

						if (existing && newEp > (existing.currentEpisode || 0)) {
							const oldEp = existing.currentEpisode || 0;
							existing.currentEpisode = newEp;
							existing.updatedAt = Date.now();
							if (data.url) mergeShowLinks(existing, data.url, newEp);
							// 追加观看历史
							if (!Array.isArray(existing.history)) existing.history = [];
							existing.history.push({ ep: newEp, ts: Date.now() });
							saveData();
							lastEpisode = newEp;
							this.renderShows();
							toast(`📺 已自动记录《${existing.name}》第 ${oldEp} → ${newEp} 集`);
						} else {
							lastEpisode = newEp;
						}
					} catch { }
				}, 800);
			};

			// Hook pushState / replaceState
			const origPush = history.pushState;
			const origReplace = history.replaceState;
			history.pushState = function (...args) { origPush.apply(this, args); checkAndRecord(); };
			history.replaceState = function (...args) { origReplace.apply(this, args); checkAndRecord(); };

			window.addEventListener('popstate', checkAndRecord);
			window.addEventListener('hashchange', checkAndRecord);
		},
	};

	App.init();
})();