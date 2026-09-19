import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
    import { getFirestore, collection, doc, setDoc, getDoc, getDocs, deleteDoc, updateDoc, writeBatch } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
    import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

    const firebaseConfig = {
        apiKey: "AIzaSyBQ7hfoJkvMNRT4qPoSz5CyJ2KisOAYXSA",
        authDomain: "vocabmin-app.firebaseapp.com",
        projectId: "vocabmin-app",
        storageBucket: "vocabmin-app.firebasestorage.app",
        messagingSenderId: "995953552362",
        appId: "1:995953552362:web:2b36cd803765a622bca093",
        measurementId: "G-TLX1STZPB3"
    };

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();

    // --- 1. CONFIG & TRANSLATIONS ---
    const CONFIG = {
        defaults: { darkMode: false, lang: 'zh', themeStyle: 'glass', listViewMode: 'grid', basicMode: false, mergeReview: false, reviewLimit: 30, articleHighlight: false }
    };
    
    const TRANSLATIONS = {
        zh: {
            title_list: "單字庫", title_settings: "設定", title_add: "新增單字", title_edit: "修改單字", title_review: "複習", title_stats: "學習檢視", title_reader: "閱讀文章",
            btn_input: "新增單字", btn_review: "開始複習", btn_list: "單字庫", btn_stats: "學習統計", btn_reader: "閱讀文章",btn_pdf: "PDF 書籍",btn_import_json: "匯入備份 (JSON)",btn_export_json: "匯出備份 (JSON)",btn_import_txt: "匯入書籍/文章 (.txt)",
            tab_single: "單筆輸入", tab_bulk: "批量匯入 (Excel)",
            lbl_word: "單字", lbl_pos: "詞性", lbl_def: "解釋", lbl_ex: "例句",
            btn_save: "儲存", btn_add_def: "新增釋義", btn_import: "匯入資料", btn_import_csv: "匯入 CSV", btn_export: "匯出 CSV", btn_clear: "清空所有資料", btn_add_article: "新增文章",
            opt_dark_mode: "深色模式", opt_theme_style: "主題風格", opt_basic_mode: "基礎模式", desc_basic_mode: "解釋與例句增加發音按鈕",
            opt_merge_review: "合併複習", desc_merge_review: "相同單字合併為一張卡片",
            opt_review_limit: "單次複習數量", desc_review_limit: "限制每次複習的單字量",
            sec_appearance: "外觀", sec_language: "語言", sec_data: "資料管理", sec_review: "複習設定",
            lvl_new: "陌生", lvl_learning: "學習", lvl_familiar: "熟悉", lvl_mastered: "精通",
            ph_search: "搜尋單字...", hint_flip: "點擊翻轉", hint_keyboard: "空白鍵: 翻牌 | →: 下一張 | 1-4: 評分", hint_edit_multiple: "此單字有多個釋義", hint_add_multiple: "可新增多個釋義",
            stat_added: "新增", stat_reviewed: "複習", stats_total_words: "總單字量", stat_today: "今日概況", stat_added_short: "新增", stat_reviewed_short: "複習", stat_month_added: "本月新增", stat_month_reviewed: "本月複習",
            msg_saved: "儲存成功", msg_updated: "更新成功", msg_empty: "請輸入完整資料", msg_duplicate: "單字已存在", msg_imported: "匯入成功", msg_cleared: "資料已清空", confirm_clear_all: "確定要清空雲端與本地所有資料嗎？此操作無法復原。", hint_no_review_words: "沒有符合篩選條件或到期的單字", hint_select_text_first: "請先在文章中反白選取文字",
            list_header_word: "單字", list_header_pos: "詞性", list_header_level: "熟練度", list_header_action: "操作",
        },
        en: {
            title_list: "Vocabulary", title_settings: "Settings", title_add: "Add Word", title_edit: "Edit Word", title_review: "Review", title_stats: "Stats", title_reader: "Reader",
            btn_input: "Add Words", btn_review: "Start Review", btn_list: "Library", btn_stats: "Statistics", btn_reader: "Reader",btn_pdf: "PDF Books",btn_import_json: "Import Backup (JSON)",btn_export_json: "Export Backup (JSON)",btn_import_txt: "Import Book/Article (.txt)",
            tab_single: "Single", tab_bulk: "Bulk",
            lbl_word: "Word", lbl_pos: "POS", lbl_def: "Definition", lbl_ex: "Example",
            btn_save: "Save", btn_add_def: "Add Def", btn_import: "Import", btn_import_csv: "Import CSV", btn_export: "Export CSV", btn_clear: "Clear Data", btn_add_article: "New Article",
            opt_dark_mode: "Dark Mode", opt_theme_style: "Theme", opt_basic_mode: "Basic Mode", desc_basic_mode: "TTS for definitions",
            opt_merge_review: "Merge Review", desc_merge_review: "Merge same words into one card",
            opt_review_limit: "Review Limit", desc_review_limit: "Max words per session",
            sec_appearance: "Appearance", sec_language: "Language", sec_data: "Data", sec_review: "Review Settings",
            lvl_new: "New", lvl_learning: "Learning", lvl_familiar: "Familiar", lvl_mastered: "Mastered",
            ph_search: "Search...", hint_flip: "Tap to flip", hint_keyboard: "Space: Flip | →: Next | 1-4: Rate", hint_edit_multiple: "Multiple definitions", hint_add_multiple: "Add multiple meanings",
            stat_added: "Added", stat_reviewed: "Reviewed", stats_total_words: "Total Words", stat_today: "Today", stat_added_short: "Added", stat_reviewed_short: "Reviewed", stat_month_added: "Month Added", stat_month_reviewed: "Month Reviewed",
            msg_saved: "Saved!", msg_updated: "Updated!", msg_empty: "Please fill in fields", msg_duplicate: "Word already exists!", msg_imported: "Import successful!", msg_cleared: "All data cleared", confirm_clear_all: "Are you sure you want to clear all data? This cannot be undone.", hint_no_review_words: "No review cards due for current filters", hint_select_text_first: "Please select text in the article first",
            list_header_word: "Word", list_header_pos: "POS", list_header_level: "Level", list_header_action: "Action"
        }
    };

    const REVIEW_STAGES = [1, 3, 7, 14, 30, 60, 120, 240, 365];

    // --- 2. STATE ---
    const AppState = {
        user: null, // Firebase User
        words: [], articles: [], dailyStats: {}, settings: { ...CONFIG.defaults },
        review: { queue: [], index: 0, isFlipped: false, filters: [0, 1, 2, 3] },
        calDate: new Date(), editingIds: [],
        currentTokens: [],
        tempSentence: "",
        reader: { sentences: [], currentSentenceIdx: 0, isPlaying: false, isPaused: false, speed: 1.0 },
        backup: null
    };

    // --- 3. CORE (Business Logic) ---
    const Core = {
        init: () => {
            const btnLogin = document.getElementById('btn-login');
            const authStatus = document.getElementById('auth-status');
            const overlay = document.getElementById('auth-overlay');
            const loader = document.getElementById('global-loader'); 

            btnLogin.addEventListener('click', async () => {
                try {
                    await signInWithPopup(auth, provider);
                } catch (error) {
                    console.error("Login Error:", error);
                    alert("登入失敗: " + error.message);
                }
            });

            window.logout = () => signOut(auth).then(()=> location.reload());

            onAuthStateChanged(auth, async (user) => {
                if (user) {
                    AppState.user = user;
                    overlay.classList.add('opacity-0', 'pointer-events-none');
                    await Core.loadFromCloud(); 
                    
                    UI.init();
                    Core.checkDecay(); 
                    UI.toast(`歡迎回來, ${user.displayName}`);

                    if(loader) {
                        loader.classList.add('opacity-0', 'pointer-events-none');
                        setTimeout(() => loader.remove(), 500);
                    }
                } else {
                    overlay.classList.remove('opacity-0', 'pointer-events-none');
                    if(loader) {
                        loader.classList.add('opacity-0', 'pointer-events-none');
                        setTimeout(() => loader.remove(), 500);
                    }
                }
            });
        },

        loadFromCloud: async () => {
            if (!AppState.user) return;
            const uid = AppState.user.uid;

            // 1. Load Settings
            const settingsSnap = await getDoc(doc(db, 'users', uid, 'data', 'settings'));
            if (settingsSnap.exists()) {
                const data = settingsSnap.data();
                if (data.ai) delete data.ai;
                AppState.settings = { ...AppState.settings, ...data };
            }

            // 2. Load Stats
            const statsSnap = await getDoc(doc(db, 'users', uid, 'data', 'stats'));
            if (statsSnap.exists()) AppState.dailyStats = statsSnap.data();

            // 3. Load Words (Subcollection)
            const wordsSnap = await getDocs(collection(db, 'users', uid, 'words'));
            AppState.words = [];
            wordsSnap.forEach(doc => AppState.words.push(doc.data()));
            AppState.words.sort((a, b) => b.timestamp - a.timestamp);

            // 4. Load Articles (Subcollection)
            const articlesSnap = await getDocs(collection(db, 'users', uid, 'articles'));
            AppState.articles = [];
            articlesSnap.forEach(doc => AppState.articles.push(doc.data()));
            AppState.articles.sort((a, b) => b.timestamp - a.timestamp);

            UI.applySettings();
            UI.updateStats();
        },

        addWord: async (data) => {
            if (!AppState.user) return;
            const now = Date.now();
            const id = now + Math.random().toString(36).substr(2, 5);
            const lvl = data.level !== undefined ? parseInt(data.level) : 0;
            const newWord = { 
                id: id,
                ...data, 
                level: isNaN(lvl) ? 0 : lvl, 
                timestamp: now, 
                lastReview: now 
            };

            await setDoc(doc(db, 'users', AppState.user.uid, 'words', id), newWord);
            AppState.words.unshift(newWord);
            Core.recordActivity('added');
        },

        updateWord: async (id, data) => {
            if (!AppState.user) return;
            const idx = AppState.words.findIndex(w => w.id === id);
            if (idx > -1) {
                const updated = { ...AppState.words[idx], ...data };
                await updateDoc(doc(db, 'users', AppState.user.uid, 'words', id), data);
                AppState.words[idx] = updated;
            }
        },

        deleteWord: async (id) => {
            if (!AppState.user) return;
            await deleteDoc(doc(db, 'users', AppState.user.uid, 'words', id));
            AppState.words = AppState.words.filter(w => w.id !== id);
            UI.updateStats();
        },

        deleteGroup: async (term) => {
            if (!AppState.user) return;
            const toDelete = AppState.words.filter(w => w.term.toLowerCase() === term.toLowerCase());
            
            for (let i = 0; i < toDelete.length; i += 400) {
                const batch = writeBatch(db);
                toDelete.slice(i, i + 400).forEach(w => {
                    batch.delete(doc(db, 'users', AppState.user.uid, 'words', w.id));
                });
                await batch.commit();
            }

            AppState.words = AppState.words.filter(w => w.term.toLowerCase() !== term.toLowerCase());
            UI.updateStats();
        },

        addArticle: async (title, content) => {
            if (!AppState.user) return;
            const now = Date.now();
            const id = now + Math.random().toString(36).substr(2, 5);
            const excerpt = content.substring(0, 100).replace(/\n/g, ' ') + '...';
            const newArt = { id, title, content, excerpt, timestamp: now };
            
            await setDoc(doc(db, 'users', AppState.user.uid, 'articles', id), newArt);
            AppState.articles.unshift(newArt);
        },

        updateArticle: async (id, title, content) => {
            if (!AppState.user) return;
            const excerpt = content.substring(0, 100) + '...';
            await updateDoc(doc(db, 'users', AppState.user.uid, 'articles', id), { title, content, excerpt });
            
            const idx = AppState.articles.findIndex(a => a.id === id);
            if (idx > -1) AppState.articles[idx] = { ...AppState.articles[idx], title, content, excerpt };
        },

        deleteArticle: async (id) => {
            if (!AppState.user) return;
            await deleteDoc(doc(db, 'users', AppState.user.uid, 'articles', id));
            AppState.articles = AppState.articles.filter(a => a.id !== id);
        },

        recordActivity: async (type) => {
            if (!AppState.user) return;
            const today = new Date().toISOString().split('T')[0];
            if (!AppState.dailyStats[today]) AppState.dailyStats[today] = { added: 0, reviewed: 0 };
            AppState.dailyStats[today][type]++;
            
            await setDoc(doc(db, 'users', AppState.user.uid, 'data', 'stats'), AppState.dailyStats);
            UI.updateStats();
        },

        saveSettings: async () => {
            if (!AppState.user) return;
            await setDoc(doc(db, 'users', AppState.user.uid, 'data', 'settings'), AppState.settings);
        },

        checkDecay: async () => {
            if (!AppState.user) return 0;
            const now = Date.now();
            let decayedCount = 0;
            const pendingUpdates = [];

            AppState.words.forEach(w => {
                if (!w.interval) w.interval = 1;
                if (!w.nextReview) w.nextReview = (w.lastReview || now) + (w.interval * 86400000);
                const overdueDays = (now - w.nextReview) / (1000 * 60 * 60 * 24);

                if (overdueDays > 0) {
                    let originalLevel = w.level;
                    if (overdueDays > 3) w.level = 0;
                    else if (overdueDays > 1 && w.level > 1) w.level = 1;
                    else if (w.level === 3) w.level = 2;

                    if (w.level !== originalLevel) {
                        decayedCount++;
                        pendingUpdates.push({ id: w.id, level: w.level });
                    }
                }
            });

            if (pendingUpdates.length > 0) {
                for (let i = 0; i < pendingUpdates.length; i += 400) {
                    const batch = writeBatch(db);
                    pendingUpdates.slice(i, i + 400).forEach(u => {
                        batch.update(doc(db, 'users', AppState.user.uid, 'words', u.id), { level: u.level });
                    });
                    await batch.commit();
                }

                setTimeout(() => {
                    UI.toast(`雲端同步：${decayedCount} 個單字因未即時複習而更新狀態`);
                }, 2000);
                if (!document.getElementById('view-list').classList.contains('hidden')) {
                    UI.renderList(document.getElementById('list-search').value);
                }
            }
            return decayedCount;
        },

        importCSV: async (text) => {
             let stats = { added: 0, skipped: 0, invalid: 0 };
             const parseLine = (line) => {
                 const looksLikeCSV = line.includes('","') || (line.trim().startsWith('"') && line.trim().endsWith('"'));
                 if (!looksLikeCSV && line.includes('\t')) { return line.split('\t').map(s => s.trim().replace(/^"|"$/g, '').replace(/""/g, '"')); }
                 const row = []; let current = ''; let inQuote = false;
                 for (let i = 0; i < line.length; i++) {
                     const c = line[i];
                     if (c === '"') { if (inQuote && line[i+1] === '"') { current += '"'; i++; } else { inQuote = !inQuote; } } 
                     else if (c === ',' && !inQuote) { row.push(current.trim()); current = ''; } 
                     else { current += c; }
                 }
                 row.push(current.trim()); return row;
             };
             const detectPOS = (str) => {
                 if (!str) return 'n.';
                 str = str.toLowerCase().replace(/[^a-z]/g, '');
                 if (str === 'noun' || str === 'n') return 'n.';
                 if (str === 'verb' || str === 'v') return 'v.';
                 if (str === 'adjective' || str === 'adj') return 'adj.';
                 if (str === 'adverb' || str === 'adv') return 'adv.';
                 if (str === 'phrase' || str === 'phr') return 'phr.';
                 return 'other';
             };

             const lines = text.split(/\r?\n/);
             const batch = writeBatch(db);
             let batchOpCount = 0;

             for(let index=0; index < lines.length; index++) {
                 const line = lines[index];
                 if (!line.trim()) continue;
                 const lineLower = line.toLowerCase();
                 if (index === 0 && (lineLower.includes('word,pos') || lineLower.includes('"word","pos"'))) continue;
                 
                 const p = parseLine(line);
                 if (p.length < 2) { stats.invalid++; continue; }
                 
                 let term = p[0], pos = 'n.', def = '', ex = '', level = 0;
                 if (p.length >= 5) { pos = detectPOS(p[1]); def = p[2]; ex = p[3]; level = p[4]; } 
                 else if (p.length === 4) { pos = detectPOS(p[1]); def = p[2]; ex = p[3]; } 
                 else if (p.length === 3) {
                     const det = detectPOS(p[1]);
                     if (det !== 'other' || p[1].length < 6) { pos = det; def = p[2]; } else { def = p[1]; ex = p[2]; }
                 } else { def = p[1]; }
                 
                 if (term && def) {
                     if (!AppState.words.some(w => w.term.toLowerCase() === term.toLowerCase() && w.def === def)) {
                         const now = Date.now();
                         const id = now + Math.random().toString(36).substr(2, 5) + index;
                         const newWord = { id, term, pos, def, ex, level: parseInt(level)||0, timestamp: now, lastReview: now, interval: 1 };
                         
                         batch.set(doc(db, 'users', AppState.user.uid, 'words', id), newWord);
                         AppState.words.unshift(newWord);
                         batchOpCount++;
                         stats.added++;

                         if(batchOpCount >= 450) {
                             await batch.commit();
                             batchOpCount = 0;
                         }
                     } else { stats.skipped++; }
                 } else { stats.invalid++; }
             }
             
             if(batchOpCount > 0) await batch.commit();
             return stats;
        }
    };

    // --- 4. UTILS ---
    const Utils = {
        t: (k) => {
            const lang = (AppState.settings && AppState.settings.lang) || 'zh';
            const dict = TRANSLATIONS[lang] || TRANSLATIONS['zh'];
            return dict[k] || k;
        },
        escapeHtml: (str) => {
            if (!str) return '';
            return String(str).replace(/[&<>"']/g, m => ({
                '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
            })[m]);
        },
        speak: (text, e, rate = 1.0, onEnd = null) => {
            if (e) e.stopPropagation();
            if (!text) return;
            window.speechSynthesis.cancel();
            const u = new SpeechSynthesisUtterance(text);
            u.lang = 'en-US';
            u.rate = parseFloat(rate);
            if (onEnd) u.onend = onEnd;
            speechSynthesis.speak(u);
        },
        speakCurrent: (e) => {
            if (e) e.stopPropagation();
            const w = AppState.review.queue[AppState.review.index];
            const term = w.entries ? w.entries[0].term : w.term;
            if (term) Utils.speak(term);
        },
        getSentence: (index, tokens) => {
            if (!tokens || index < 0 || index >= tokens.length) return "";
            const ends = ['.', '?', '!', '\n'];
            let start = index;
            while (start > 0) {
                const t = tokens[start];
                if (ends.some(e => t.includes(e))) { start++; break; }
                start--;
            }
            let end = index;
            while (end < tokens.length) {
                const t = tokens[end];
                if (ends.some(e => t.includes(e))) { break; }
                end++;
            }
            return tokens.slice(start, end + 1).join('').trim();
        }
    };

    // --- 5. UI ---
    const UI = {
        init: () => {
            UI.applySettings();
            UI.renderCalendar();
            UI.updateStats();
            document.addEventListener('click', (e) => {
                if (!e.target.closest('#word-popup') && !e.target.classList.contains('reader-word')) {
                    UI.reader.hidePopup();
                    if (AppState.reader.isPlaying && window.speechSynthesis.paused) {
                        window.speechSynthesis.resume();
                    }
                }
            });
            Controller.forms.appendDefinition('add-definitions-container');
        },
        show: (id) => {
            document.querySelectorAll('.view-section').forEach(el => el.classList.add('hidden'));
            document.getElementById(id).classList.remove('hidden');
            UI.reader.hidePopup(); 
            Controller.reader.stopArticle();
            if (id === 'view-list') UI.renderList();
            if (id === 'view-stats') UI.renderCalendar();
        },
        toast: (keyOrMsg) => {
            const el = document.getElementById('toast');
            const t = TRANSLATIONS[AppState.settings.lang];
            const msg = t[keyOrMsg] || keyOrMsg;
            document.getElementById('toast-msg').innerText = msg;
            el.classList.remove('opacity-0', 'translate-y-[-20px]');
            el.style.transform = 'translate(-50%, 0)';
            el.style.opacity = '1';
            setTimeout(() => {
                el.style.transform = 'translate(-50%, -20px)';
                el.style.opacity = '0';
            }, 3000);
        },
        applySettings: () => {
            const s = AppState.settings;
            document.documentElement.classList.toggle('dark', s.darkMode);
            document.getElementById('toggle-dark-mode').checked = s.darkMode;
            document.body.classList.toggle('theme-simple', s.themeStyle === 'simple');
            document.getElementById('toggle-basic-mode').checked = s.basicMode;
            document.getElementById('toggle-merge-review').checked = s.mergeReview;
            if(document.getElementById('review-limit-select')) document.getElementById('review-limit-select').value = s.reviewLimit || 30;
            
            const glassBtn = document.getElementById('btn-theme-glass'), simpleBtn = document.getElementById('btn-theme-simple');
            if (glassBtn) {
                const active = 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-white shadow-sm';
                const inactive = 'text-gray-500';
                glassBtn.className = `px-3 py-1.5 rounded-md text-xs font-bold transition ${s.themeStyle === 'glass' ? active : inactive}`;
                simpleBtn.className = `px-3 py-1.5 rounded-md text-xs font-bold transition ${s.themeStyle === 'simple' ? active : inactive}`;
            }
            const t = TRANSLATIONS[s.lang];
            document.querySelectorAll('[data-i18n]').forEach(el => el.innerText = t[el.getAttribute('data-i18n')] || el.getAttribute('data-i18n'));
            document.querySelectorAll('[data-i18n-placeholder]').forEach(el => el.placeholder = t[el.getAttribute('data-i18n-placeholder')]);
            document.getElementById('lang-zh').classList.toggle('bg-indigo-50', s.lang === 'zh');
            document.getElementById('lang-en').classList.toggle('bg-indigo-50', s.lang === 'en');
        },
        updateStats: () => {
            document.getElementById('total-count').innerText = AppState.words.length;
            const c = [0, 0, 0, 0];
            AppState.words.forEach(w => c[w.level || 0]++);
            [0, 1, 2, 3].forEach(i => document.getElementById(`stat-lvl-${i}`).innerText = c[i]);
            const rate = AppState.words.length ? (c[3] + c[2] * 0.5) / AppState.words.length : 0;
            const circle = document.getElementById('progress-circle');
            if (circle) circle.style.strokeDashoffset = 283 - (rate * 283);
        },
        renderList: (q = '') => {
            const term = q.toLowerCase();
            const filtered = AppState.words.filter(w => w.term.toLowerCase().includes(term) || w.def.includes(term));
            
            const groups = {};
            filtered.forEach(w => {
                const key = w.term.toLowerCase();
                if(!groups[key]) groups[key] = [];
                groups[key].push(w);
            });
            
            const uniqueTerms = Object.keys(groups);
            document.getElementById('list-count').innerText = uniqueTerms.length;
            const container = document.getElementById('word-list-container');
            const mode = AppState.settings.listViewMode;
            const basic = AppState.settings.basicMode;
            
            document.getElementById('btn-view-grid').className = `p-1.5 rounded-md transition ${mode === 'grid' ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-white shadow-sm' : 'text-gray-500'}`;
            document.getElementById('btn-view-list').className = `p-1.5 rounded-md transition ${mode === 'list' ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-white shadow-sm' : 'text-gray-500'}`;

            if (!uniqueTerms.length) { container.innerHTML = `<div class="col-span-full text-center mt-20 text-gray-400">Nothing found</div>`; return; }

            const baseClass = "flex-1 overflow-y-auto custom-scrollbar p-4";
            
            if (mode === 'grid') {
                container.className = `${baseClass} grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-20`;
                container.innerHTML = uniqueTerms.map(term => UI.Templates.gridItem(groups[term], basic)).join('');
            } else {
                container.className = `${baseClass} space-y-0 pb-20`;
                container.innerHTML = `<div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                    ${UI.Templates.listHeader()}
                    ${uniqueTerms.map(term => UI.Templates.listItem(groups[term])).join('')}
                </div>`;
            }
        },
        renderCalendar: () => {
            const y = AppState.calDate.getFullYear(), m = AppState.calDate.getMonth();
            document.getElementById('calendar-month-year').innerText = `${y} / ${m + 1}`;
            const grid = document.getElementById('calendar-grid');
            grid.innerHTML = '';
            
            const firstDay = new Date(y, m, 1).getDay();
            const days = new Date(y, m + 1, 0).getDate();
            for (let i = 0; i < firstDay; i++) grid.appendChild(document.createElement('div'));

            let mAdd = 0, mRev = 0;
            for (let d = 1; d <= days; d++) {
                const ds = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                const st = AppState.dailyStats[ds] || { added: 0, reviewed: 0 };
                mAdd += st.added; mRev += st.reviewed;
                grid.innerHTML += UI.Templates.calCell(d, st);
            }
            document.getElementById('month-added-count').innerText = mAdd;
            document.getElementById('month-reviewed-count').innerText = mRev;
            
            const today = new Date().toISOString().split('T')[0];
            const tStat = AppState.dailyStats[today] || { added: 0, reviewed: 0 };
            document.getElementById('today-added-count').innerText = tStat.added;
            document.getElementById('today-reviewed-count').innerText = tStat.reviewed;
        },
        changeMonth: (d) => { AppState.calDate.setMonth(AppState.calDate.getMonth() + d); UI.renderCalendar(); },
        
        reader: {
            renderArticleList: () => {
                const container = document.getElementById('articles-container');
                const empty = document.getElementById('empty-articles');
                if (AppState.articles.length === 0) {
                    container.innerHTML = ''; empty.classList.remove('hidden'); return;
                }
                empty.classList.add('hidden');
                container.innerHTML = AppState.articles.map(a => `
                    <div class="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition cursor-pointer group relative" onclick="Controller.nav.reader('${a.id}')">
                        <h3 class="font-bold text-lg text-gray-800 dark:text-white mb-2 pr-8 truncate">${a.title}</h3>
                        <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">${a.excerpt}</p>
                        <div class="mt-4 flex justify-between items-center text-xs text-gray-400">
                            <span>${new Date(a.timestamp).toLocaleDateString()}</span>
                            <span class="group-hover:text-blue-500 transition font-bold">Read <i class="fas fa-arrow-right ml-1"></i></span>
                        </div>
                        <button onclick="event.stopPropagation(); Controller.reader.deleteArticle('${a.id}')" class="absolute top-4 right-4 text-gray-300 hover:text-red-500 p-1 transition"><i class="fas fa-trash-alt"></i></button>
                    </div>
                `).join('');
            },
            renderContent: (articleId) => {
                const article = AppState.articles.find(a => a.id === articleId);
                if (!article) return;
                
                document.getElementById('reader-title').innerText = article.title;
                const body = document.getElementById('reader-body');
                const isHighlight = AppState.settings.articleHighlight;
                
                const btnHighlight = document.getElementById('btn-toggle-highlight');
                if (isHighlight) {
                    body.classList.add('highlight-on');
                    btnHighlight.className = "px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-2 bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400";
                } else {
                    body.classList.remove('highlight-on');
                    btnHighlight.className = "px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700";
                }

                AppState.currentTokens = article.content.split(/([^a-zA-Z0-9'-]+)/);
                
                body.innerHTML = '';
                const fragment = document.createDocumentFragment();

                AppState.currentTokens.forEach((token, index) => {
                    if (/^[a-zA-Z][a-zA-Z0-9'-]*$/.test(token)) {
                        const span = document.createElement('span');
                        span.className = 'reader-word';
                        const lower = token.toLowerCase();
                        const wordEntries = AppState.words.filter(w => w.term.toLowerCase() === lower);
                        if (wordEntries.length > 0) {
                            const minLevel = Math.min(...wordEntries.map(w => w.level || 0));
                            span.classList.add(`word-lvl-${minLevel}`);
                        }
                        span.textContent = token;
                        span.addEventListener('click', (e) => {
                            e.stopPropagation();
                            Controller.reader.clickWord(span, token, index);
                        });
                        fragment.appendChild(span);
                    } else {
                        const parts = token.split('\n');
                        parts.forEach((part, pIdx) => {
                            if (part) {
                                fragment.appendChild(document.createTextNode(part));
                            }
                            if (pIdx < parts.length - 1) {
                                fragment.appendChild(document.createElement('br'));
                            }
                        });
                    }
                });
                body.appendChild(fragment);
            },
            showPopup: (rect, word, knownEntries, contextSentence) => {
                if (AppState.reader.isPlaying) window.speechSynthesis.pause();
                const popup = document.getElementById('word-popup');
                const pKnown = document.getElementById('popup-known');
                const pNew = document.getElementById('popup-new');
                
                document.getElementById('popup-word').innerText = word;
                
                if (knownEntries && knownEntries.length > 0) {
                    pKnown.classList.remove('hidden');
                    pNew.classList.add('hidden');
                    
                    const defsHtml = knownEntries.map(w => 
                        `<div class="border-l-2 border-indigo-200 dark:border-indigo-800 pl-2">
                            <div class="flex items-center gap-1"><span class="text-xs font-bold text-indigo-500">${w.pos}</span> <span class="font-bold">${w.def}</span></div>
                            ${w.ex ? `<div class="text-xs text-gray-500 italic mt-1 flex items-start gap-1"><button onclick="Utils.speak('${w.ex.replace(/'/g,"\\'").replace(/"/g,'&quot;')}', event, 1.0)" class="text-indigo-400 hover:text-indigo-600 flex-shrink-0" title="Play"><i class="fas fa-volume-up"></i></button> <span>"${w.ex}"</span></div>` : ''}
                        </div>`
                    ).join('');
                    document.getElementById('popup-defs').innerHTML = defsHtml;
                    
                    const avgLvl = Math.round(knownEntries.reduce((a,b)=>a+(b.level||0),0)/knownEntries.length);
                    const lvlNames = ["陌生", "學習", "熟悉", "精通"];
                    document.getElementById('popup-level').innerText = lvlNames[avgLvl];
                    document.getElementById('btn-popup-edit').onclick = () => { UI.reader.hidePopup(); Controller.nav.edit(knownEntries[0].id); };
                } else {
                    pKnown.classList.add('hidden');
                    pNew.classList.remove('hidden');
                    document.getElementById('popup-input-def').value = '';
                    AppState.tempSentence = contextSentence || '';
                    document.getElementById('popup-input-ex').value = AppState.tempSentence;
                    document.getElementById('popup-input-def').focus();
                }
                
                let top = rect.bottom + 10;
                let left = rect.left;
                if (top + 300 > window.innerHeight) top = rect.top - 310;
                if (left + 320 > window.innerWidth) left = window.innerWidth - 330;

                popup.style.top = `${top}px`;
                popup.style.left = `${left}px`;
                popup.classList.remove('hidden');
                requestAnimationFrame(() => {
                    popup.classList.remove('scale-95', 'opacity-0');
                    popup.classList.add('scale-100', 'opacity-100');
                });
            },
            hidePopup: () => {
                const popup = document.getElementById('word-popup');
                popup.classList.add('scale-95', 'opacity-0');
                popup.classList.remove('scale-100', 'opacity-100');
                setTimeout(() => popup.classList.add('hidden'), 200);
            },
            updatePlayButton: (isPlaying) => {
                const btn = document.getElementById('btn-reader-play');
                if (btn) btn.innerHTML = isPlaying ? '<i class="fas fa-pause text-xs ml-px"></i>' : '<i class="fas fa-play text-xs ml-0.5"></i>';
            }
        },
        Templates: {
            gridItem: (entries, basic) => {
                const w = entries[0];
                const colors = { 'n.': 'bg-dict-n', 'v.': 'bg-dict-v', 'adj.': 'bg-dict-adj', 'adv.': 'bg-dict-adv', 'phr.': 'bg-dict-phr', 'other': 'bg-gray-500' };
                const interval = w.interval || 0;
                const nextRev = w.nextReview || (Date.now());
                const daysUntil = Math.ceil((nextRev - Date.now()) / 86400000);
                let statusText = ""; let statusColor = "text-gray-400";
                if (interval === 0) { statusText = "New"; }
                else if (daysUntil <= 0) { statusText = "Due Now!"; statusColor = "text-red-500 font-bold"; }
                else { statusText = `In ${daysUntil} days`; }

                const defsHtml = entries.map(e => `
                    <div class="mb-3 border-l-2 ${basic ? 'border-gray-300 dark:border-gray-600' : 'border-transparent'} pl-2">
                        <div class="flex items-center gap-2 mb-1">
                            <span class="${colors[e.pos] || 'bg-gray-500'} text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">${e.pos}</span>
                            <span class="text-gray-700 dark:text-gray-300 font-medium text-sm">${e.def}</span>
                            ${basic ? `<button onclick="Utils.speak('${e.def.replace(/'/g,"\\'")}', event)" class="text-gray-400 hover:text-indigo-500"><i class="fas fa-volume-up text-[10px]"></i></button>` : ''}
                        </div>
                        ${e.ex ? `<p class="text-xs text-gray-500 dark:text-gray-400 italic">"${e.ex}"</p>` : ''}
                    </div>
                `).join('');

                const avgLevel = Math.round(entries.reduce((a,b)=>a+(b.level||0),0)/entries.length);
                return `<div class="group bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all relative flex flex-col h-full">
                    <div class="flex-1">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-xl font-bold text-gray-800 dark:text-gray-100">${w.term}</h3>
                            <button onclick="Utils.speak('${w.term.replace(/'/g,"\\'")}', event)" class="text-indigo-300 hover:text-indigo-500 text-lg"><i class="fas fa-volume-up"></i></button>
                        </div>
                        <div class="max-h-60 overflow-y-auto pr-1">
                            ${defsHtml}
                        </div>
                    </div>
                    <div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <div class="flex justify-between items-center opacity-80">
                            <div class="flex gap-1" title="Current Level">${[...Array(avgLevel)].map(()=>`<div class="w-1.5 h-1.5 rounded-full bg-green-400"></div>`).join('')}</div>
                            <div class="text-[10px] font-mono flex flex-col items-end">
                                <span class="${statusColor}">${statusText}</span>
                                <span class="text-gray-300" title="Review Interval">IVL: ${interval}d</span>
                            </div>
                        </div>
                        <div class="absolute bottom-4 right-1/2 translate-x-1/2 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-gray-800 px-2 py-1 rounded-lg shadow-sm border border-gray-100 dark:border-gray-600">
                            <button onclick="Controller.nav.edit('${w.id}')" class="text-blue-500 hover:bg-blue-50 p-1 rounded"><i class="fas fa-pen text-xs"></i></button>
                            <button onclick="Controller.data.deleteGroup('${w.term.replace(/'/g,"\\'")}')" class="text-red-500 hover:bg-red-50 p-1 rounded"><i class="fas fa-trash-alt text-xs"></i></button>
                        </div>
                    </div>
                </div>`;
            },
            listHeader: () => {
                const t = TRANSLATIONS[AppState.settings.lang];
                return `<div class="grid grid-cols-12 gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 text-xs font-bold text-gray-500 uppercase">
                    <div class="col-span-3 pl-2">${t.list_header_word}</div>
                    <div class="col-span-7">Definitions</div>
                    <div class="col-span-2 text-right pr-2">${t.list_header_action}</div>
                </div>`;
            },
            listItem: (entries) => {
                const w = entries[0];
                const posColors = { 'n.':'text-blue-500', 'v.':'text-pink-500', 'adj.':'text-amber-500', 'adv.':'text-purple-500' };
                const now = Date.now();
                const elapsedDays = (now - w.lastReview) / (1000 * 60 * 60 * 24);
                const stability = w.interval || 1;
                let retention = Math.max(0, 100 - (elapsedDays / stability * 100));
                if (now > w.nextReview) retention = 0;
                let barColor = 'bg-green-400';
                if (retention < 50) barColor = 'bg-orange-400';
                if (retention < 20) barColor = 'bg-red-500';

                const defs = entries.map(e => `<div class="flex items-center gap-2 text-sm"><span class="text-xs font-bold w-8 ${posColors[e.pos] || 'text-teal-500'}">${e.pos}</span> <span class="text-gray-700 dark:text-gray-300 truncate">${e.def}</span></div>`).join('');

                return `<div class="grid grid-cols-12 gap-2 p-3 border-b border-gray-100 dark:border-gray-700 last:border-0 items-start hover:bg-gray-50 dark:hover:bg-gray-700/30 transition relative group">
                    <div class="absolute bottom-0 left-0 h-0.5 ${barColor} transition-all" style="width: ${retention}%; opacity: 0.5;"></div>
                    <div class="col-span-3 pl-2 font-bold text-gray-800 dark:text-gray-200 flex flex-col">
                        <div class="flex items-center gap-2">
                            ${w.term}
                            <i class="fas fa-volume-up text-xs text-gray-300 hover:text-indigo-500 cursor-pointer" onclick="Utils.speak('${w.term.replace(/'/g,"\\'")}', event)"></i>
                        </div>
                        <span class="text-[10px] text-gray-400 font-mono mt-1">IVL: ${w.interval}d</span>
                    </div>
                    <div class="col-span-7 space-y-1">${defs}</div>
                    <div class="col-span-2 flex justify-end gap-2 pr-2">
                        <button onclick="Controller.nav.edit('${w.id}')" class="text-blue-500 hover:text-blue-700 dark:text-blue-400 p-1"><i class="fas fa-pen"></i></button>
                        <button onclick="Controller.data.deleteGroup('${w.term.replace(/'/g,"\\'")}')" class="text-red-500 hover:text-red-700 dark:text-red-400 p-1"><i class="fas fa-trash-alt"></i></button>
                    </div>
                </div>`;
            },
            calCell: (d, st) => {
                const intensity = Math.min((st.added + st.reviewed) / 10, 1);
                const bg = (st.added + st.reviewed > 0) ? `bg-purple-${Math.ceil(intensity*5)*100} dark:bg-purple-900/${Math.ceil(intensity*8)*10}` : 'bg-gray-50 dark:bg-gray-700/50';
                return `<div class="h-10 rounded-lg flex flex-col items-center justify-center text-[10px] ${bg} border border-transparent transition hover:scale-110">
                    <span class="font-bold ${intensity > 0.5 ? 'text-white' : 'text-gray-500'}">${d}</span>
                    ${st.added || st.reviewed ? `<div class="flex gap-0.5"><div class="w-1 h-1 rounded-full bg-indigo-400"></div></div>` : ''}
                </div>`;
            },
            defBlock: (index, data = {}) => {
                const { id='', pos='n.', def='', ex='' } = data;
                return `<div class="def-block p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-200 dark:border-gray-600 relative group" data-index="${index}">
                    <input type="hidden" class="inp-def-id" value="${id}">
                    <button onclick="this.closest('.def-block').remove()" class="absolute top-2 right-2 text-red-400 hover:text-red-600 p-1 opacity-0 group-hover:opacity-100 transition"><i class="fas fa-times"></i></button>
                    <div class="grid grid-cols-3 gap-3 mb-3">
                        <div class="col-span-1"><label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">POS</label><select class="inp-pos w-full p-2 bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg text-sm"><option value="n." ${pos==='n.'?'selected':''}>n.</option><option value="v." ${pos==='v.'?'selected':''}>v.</option><option value="adj." ${pos==='adj.'?'selected':''}>adj.</option><option value="adv." ${pos==='adv.'?'selected':''}>adv.</option><option value="phr." ${pos==='phr.'?'selected':''}>phr.</option><option value="other" ${pos==='other'?'selected':''}>other</option></select></div>
                        <div class="col-span-2"><label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Definition</label><input type="text" class="inp-def w-full p-2 bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg text-sm font-medium" value="${def}" placeholder="Meaning"></div>
                    </div>
                    <div><label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Example</label><textarea class="inp-ex w-full p-2 bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg text-sm h-16 resize-none" placeholder="Sentence">${ex}</textarea></div>
                </div>`;
            }
        }
    };

    // --- 6. CONTROLLER ---
    const Controller = {
        init: () => {
            Core.init();
            document.addEventListener('keydown', Controller.features.handleKey);
        },
        nav: {
            home: () => UI.show('view-home'),
            settings: () => UI.show('view-settings'),
            list: () => UI.show('view-list'),
            stats: () => UI.show('view-stats'),
            add: () => {
                UI.show('view-add');
                document.getElementById('add-word').value = '';
                const container = document.getElementById('add-definitions-container');
                container.innerHTML = '';
                Controller.forms.appendDefinition('add-definitions-container');
                Controller.forms.switchTab('single');
            },
            review: () => {
                const doMerge = AppState.settings.mergeReview;
                const limit = parseInt(AppState.settings.reviewLimit) || 30;
                const filtered = AppState.words.filter(w => AppState.review.filters.includes(w.level || 0));
                
                let preparedQueue = [];

                if (doMerge) {
                    const groups = {};
                    filtered.forEach(w => {
                        const k = w.term.toLowerCase();
                        if(!groups[k]) groups[k] = [];
                        groups[k].push(w);
                    });
                    preparedQueue = Object.values(groups).map(g => ({
                        entries: g,
                        lastReview: Math.min(...g.map(i => i.lastReview || 0)),
                        nextReview: Math.min(...g.map(i => i.nextReview || ((i.lastReview || now) + (i.interval || 1) * 86400000))),
                        minLevel: Math.min(...g.map(i => i.level || 0))
                    }));
                } else {
                    preparedQueue = filtered.map(w => ({
                        entries: [w],
                        lastReview: w.lastReview || 0,
                        nextReview: w.nextReview || ((w.lastReview || now) + (w.interval || 1) * 86400000),
                        minLevel: w.level || 0
                    }));
                }

                const now = Date.now();
                preparedQueue.sort((a, b) => {
                    const aDue = (a.nextReview || 0) <= now;
                    const bDue = (b.nextReview || 0) <= now;
                    if (aDue && !bDue) return -1;
                    if (!aDue && bDue) return 1;
                    return (a.nextReview || 0) - (b.nextReview || 0);
                });

                if (preparedQueue.length > limit) {
                    preparedQueue = preparedQueue.slice(0, limit);
                }

                AppState.review.queue = preparedQueue;

                if (!AppState.review.queue.length) { UI.toast("沒有符合篩選條件的單字"); return; }
                AppState.review.index = 0; AppState.review.isFlipped = false;
                UI.show('view-review');
                Controller.features.updateReviewFilters();
                Controller.features.renderCard();
            },
            edit: (id) => {
                UI.show('view-edit');
                document.getElementById('edit-definitions-container').innerHTML = '';
                const target = AppState.words.find(w => w.id === id);
                if (target) {
                    document.getElementById('edit-word').value = target.term;
                    const related = AppState.words.filter(w => w.term.toLowerCase() === target.term.toLowerCase());
                    AppState.editingIds = related.map(r => r.id);
                    related.forEach((r, idx) => document.getElementById('edit-definitions-container').insertAdjacentHTML('beforeend', UI.Templates.defBlock(idx, r)));
                }
            },
            articlesList: () => {
                UI.show('view-articles-list');
                UI.reader.renderArticleList();
            },
            articleEdit: (id = null) => {
                UI.show('view-article-edit');
                document.getElementById('article-id').value = id || '';
                if (id) {
                    const a = AppState.articles.find(art => art.id === id);
                    document.getElementById('article-form-title').innerText = "Edit Article";
                    document.getElementById('article-title').value = a.title;
                    document.getElementById('article-content').value = a.content;
                } else {
                    document.getElementById('article-form-title').innerText = "New Article";
                    document.getElementById('article-title').value = '';
                    document.getElementById('article-content').value = '';
                }
            },
            reader: (id) => {
                AppState.currentArticleId = id;
                UI.show('view-reader');
                UI.reader.renderContent(id);
            }
        },
        forms: {
            switchTab: (mode) => {
                const isSingle = mode === 'single';
                document.getElementById('input-single-form').classList.toggle('hidden', !isSingle);
                document.getElementById('input-bulk-form').classList.toggle('hidden', isSingle);
                document.getElementById('tab-single').className = `flex-1 py-2 rounded-lg text-sm font-bold shadow-sm transition ${isSingle ? 'bg-white dark:bg-gray-600 text-gray-800 dark:text-white' : 'text-gray-500'}`;
                document.getElementById('tab-bulk').className = `flex-1 py-2 rounded-lg text-sm font-bold transition ${!isSingle ? 'bg-white dark:bg-gray-600 text-gray-800 dark:text-white shadow-sm' : 'text-gray-500'}`;
            },
            saveNew: async () => {
                const term = document.getElementById('add-word').value.trim();
                const container = document.getElementById('add-definitions-container');
                const blocks = container.querySelectorAll('.def-block');
                if (!term) { UI.toast('msg_empty'); return; }
                let savedCount = 0;
                
                for (const block of blocks) {
                    const pos = block.querySelector('.inp-pos').value;
                    const def = block.querySelector('.inp-def').value.trim();
                    const ex = block.querySelector('.inp-ex').value.trim();
                    if (def) {
                        if (!AppState.words.some(w => w.term.toLowerCase() === term.toLowerCase() && w.def === def)) {
                            await Core.addWord({ term, pos, def, ex });
                            savedCount++;
                        }
                    }
                }
                
                if (savedCount > 0) {
                    UI.toast('msg_saved');
                    document.getElementById('add-word').value = '';
                    container.innerHTML = '';
                    Controller.forms.appendDefinition('add-definitions-container');
                    document.getElementById('add-word').focus();
                } else {
                    UI.toast('msg_empty');
                }
            },
            addBulk: async () => {
                const result = await Core.importCSV(document.getElementById('inp-bulk-text').value);
                if (result.added > 0) {
                    UI.toast(`Added: ${result.added}, Skipped: ${result.skipped}`);
                    document.getElementById('inp-bulk-text').value = '';
                    Controller.nav.list();
                } else if (result.skipped > 0) {
                    UI.toast(`No new words. Skipped ${result.skipped} duplicates.`);
                } else {
                    UI.toast('No valid data found (Check format)');
                }
            },
            appendDefinition: (containerId) => {
                const container = document.getElementById(containerId);
                if(container) container.insertAdjacentHTML('beforeend', UI.Templates.defBlock(Date.now(), { id: '' }));
            },
            saveEdited: async () => {
                const term = document.getElementById('edit-word').value.trim();
                const blocks = document.querySelectorAll('#edit-definitions-container .def-block');
                if (!term || !blocks.length) { UI.toast('msg_empty'); return; }
                
                const currentIds = [];
                for (const block of blocks) {
                    const id = block.querySelector('.inp-def-id').value;
                    const pos = block.querySelector('.inp-pos').value;
                    const def = block.querySelector('.inp-def').value.trim();
                    const ex = block.querySelector('.inp-ex').value.trim();
                    if (def) {
                        if (id) { 
                             await Core.updateWord(id, { term, pos, def, ex }); 
                             currentIds.push(id); 
                        }
                        else if (!AppState.words.some(w => w.term.toLowerCase() === term.toLowerCase() && w.def === def)) { 
                             await Core.addWord({ term, pos, def, ex }); 
                        }
                    }
                }
                
                for (const oldId of AppState.editingIds) {
                     if (!currentIds.includes(oldId)) await Core.deleteWord(oldId);
                }

                UI.toast('msg_updated');
                Controller.nav.list();
            }
        },
        data: {
             importJSON: async (input) => {
                const file = input.files[0];
                if (!file) return;
                const r = new FileReader();
                r.onload = async (e) => {
                    try {
                        const data = JSON.parse(e.target.result);
                        let wCount = 0, aCount = 0;
                        const batch = writeBatch(db);
                        let ops = 0;

                        if(data.vocab_stats) {
                             AppState.dailyStats = { ...AppState.dailyStats, ...data.vocab_stats };
                             batch.set(doc(db, 'users', AppState.user.uid, 'data', 'stats'), AppState.dailyStats);
                             ops++;
                        }

                        if (data.vocab_data && Array.isArray(data.vocab_data)) {
                            const currentIds = new Set(AppState.words.map(w => w.id));
                            for (const w of data.vocab_data) {
                                if (!currentIds.has(w.id)) {
                                    batch.set(doc(db, 'users', AppState.user.uid, 'words', w.id), w);
                                    AppState.words.unshift(w);
                                    wCount++; ops++;
                                    if(ops >= 450) { await batch.commit(); ops = 0; }
                                }
                            }
                        }

                        if (data.article_data && Array.isArray(data.article_data)) {
                             const currentArtIds = new Set(AppState.articles.map(a => a.id));
                             for (const a of data.article_data) {
                                 if (!currentArtIds.has(a.id)) {
                                     batch.set(doc(db, 'users', AppState.user.uid, 'articles', a.id), a);
                                     AppState.articles.unshift(a);
                                     aCount++; ops++;
                                     if(ops >= 450) { await batch.commit(); ops = 0; }
                                 }
                             }
                        }

                        if(ops > 0) await batch.commit();

                        UI.updateStats();
                        UI.toast(`匯入成功: ${wCount} 單字, ${aCount} 文章`);
                        if (!document.getElementById('view-list').classList.contains('hidden')) UI.renderList();
                    } catch (err) {
                        console.error(err);
                        UI.toast("格式錯誤");
                    }
                };
                r.readAsText(file);
                input.value = '';
            },
            exportJSON: () => {
                const bundle = {
                    vocab_data: AppState.words,
                    article_data: AppState.articles,
                    vocab_stats: AppState.dailyStats,
                    settings: AppState.settings,
                    exportedAt: new Date().toISOString()
                };
                const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = `vocab_backup_${new Date().toISOString().slice(0,10)}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            },
            importTXT: (input) => {
                const file = input.files[0];
                if (!file) return;
                const r = new FileReader();
                r.onload = async (e) => {
                    const content = e.target.result;
                    const title = file.name.replace(/\.[^/.]+$/, "");
                    if (content && title) {
                        await Core.addArticle(title, content);
                        UI.toast(`已匯入書籍: ${title}`);
                        Controller.nav.articlesList();
                    } else {
                        UI.toast("檔案內容為空");
                    }
                };
                r.readAsText(file);
                input.value = '';
            },
            clearAll: async () => { 
                if (confirm(Utils.t('confirm_clear_all'))) { 
                    const ops = [];
                    AppState.words.forEach(w => ops.push({ ref: doc(db, 'users', AppState.user.uid, 'words', w.id) }));
                    AppState.articles.forEach(a => ops.push({ ref: doc(db, 'users', AppState.user.uid, 'articles', a.id) }));
                    ops.push({ ref: doc(db, 'users', AppState.user.uid, 'data', 'stats') });
                    
                    for (let i = 0; i < ops.length; i += 400) {
                        const batch = writeBatch(db);
                        ops.slice(i, i + 400).forEach(op => batch.delete(op.ref));
                        await batch.commit();
                    }
                    
                    AppState.words = [];
                    AppState.articles = [];
                    AppState.dailyStats = {};
                    UI.updateStats();
                    UI.renderList();
                    UI.toast("msg_cleared");
                } 
            },
            deleteGroup: async (term) => { 
                if (confirm(`刪除 "${term}" 的所有釋義?`)) { 
                    await Core.deleteGroup(term); 
                    UI.renderList(document.getElementById('list-search').value); 
                } 
            },
            exportArticles: () => {
                const data = AppState.articles;
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = `articles_backup_${new Date().toISOString().slice(0,10)}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
        },
        settings: {
            toggleDarkMode: async (v) => { AppState.settings.darkMode = v; await Core.saveSettings(); UI.applySettings(); },
            setThemeStyle: async (s) => { AppState.settings.themeStyle = s; await Core.saveSettings(); UI.applySettings(); },
            setLanguage: async (l) => { AppState.settings.lang = l; await Core.saveSettings(); UI.applySettings(); },
            toggleBasicMode: async (v) => { AppState.settings.basicMode = v; await Core.saveSettings(); UI.applySettings(); UI.renderList(); },
            toggleMergeReview: async (v) => { AppState.settings.mergeReview = v; await Core.saveSettings(); UI.applySettings(); },
            setReviewLimit: async (v) => { AppState.settings.reviewLimit = parseInt(v); await Core.saveSettings(); UI.applySettings(); }
        },
        features: {
            toggleListViewMode: async (m) => { AppState.settings.listViewMode = m; await Core.saveSettings(); UI.renderList(document.getElementById('list-search').value); },
            handleSearch: (val) => {
                const res = document.getElementById('home-search-results');
                if (!val.trim()) { res.classList.add('hidden'); return; }
                const found = AppState.words.filter(w => w.term.toLowerCase().includes(val.toLowerCase())).slice(0, 5);
                res.innerHTML = found.length ? found.map(w => `<div class="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b dark:border-gray-700" onclick="Controller.nav.edit('${w.id}')"><div class="font-bold text-gray-800 dark:text-white">${w.term}</div><div class="text-xs text-gray-500">${w.def}</div></div>`).join('') : '';
                res.classList.toggle('hidden', !found.length);
            },
            flipCard: () => {
                document.getElementById('flashcard-container').classList.toggle('flipped');
                AppState.review.isFlipped = !AppState.review.isFlipped;
            },
            setRate: async (rating, e) => {
                if (e) e.stopPropagation();
                const item = AppState.review.queue[AppState.review.index];
                if (!item || !item.entries) return;

                const batch = writeBatch(db);

                item.entries.forEach(word => {
                    const now = Date.now();
                    let currentInterval = word.interval || 0;
                    let easeFactor = word.easeFactor || 2.5; 
                    let newInterval = 1;

                    if (rating <= 1) {
                        newInterval = 1;
                        easeFactor = Math.max(1.3, easeFactor - (rating === 0 ? 0.2 : 0.15));
                    } else {
                        if (currentInterval === 0) {
                            newInterval = 1;
                        } else if (currentInterval === 1) {
                            newInterval = 3; 
                        } else {
                            const bonus = (rating === 3) ? 1.3 : 1.0;
                            newInterval = Math.ceil(currentInterval * easeFactor * bonus);
                        }

                        if (rating === 3) {
                            easeFactor = Math.min(5.0, easeFactor + 0.15);
                        }
                    }

                    let newLevel = 0;
                    if (newInterval >= 60) newLevel = 3;
                    else if (newInterval >= 14) newLevel = 2;
                    else if (newInterval >= 3) newLevel = 1;
                    else newLevel = 0;

                    const updateData = { 
                        level: newLevel, 
                        interval: newInterval, 
                        easeFactor: parseFloat(easeFactor.toFixed(2)),
                        lastReview: now, 
                        nextReview: now + (newInterval * 86400000) 
                    };
                    
                    batch.update(doc(db, 'users', AppState.user.uid, 'words', word.id), updateData);
                    
                    const localIdx = AppState.words.findIndex(w => w.id === word.id);
                    if(localIdx > -1) {
                        AppState.words[localIdx] = { ...AppState.words[localIdx], ...updateData };
                    }
                });

                await batch.commit();
                await Core.recordActivity('reviewed'); 
                
                AppState.review.index++;
                if (AppState.review.isFlipped) { 
                    setTimeout(() => { 
                        Controller.features.renderCard(); 
                        document.getElementById('flashcard-container').classList.remove('flipped'); 
                        AppState.review.isFlipped = false; 
                    }, 200); 
                } else {
                    Controller.features.renderCard();
                }
            },
            renderCard: () => {
                const q = AppState.review.queue, idx = AppState.review.index;
                if (idx >= q.length) { if (confirm("Complete! Restart?")) Controller.nav.review(); else Controller.nav.home(); return; }
                const item = q[idx]; const entries = item.entries; const mainWord = entries[0];
                if (AppState.review.isFlipped) { document.getElementById('flashcard-container').classList.remove('flipped'); AppState.review.isFlipped = false; }
                document.getElementById('card-word').innerText = mainWord.term;
                document.getElementById('card-back-word').innerText = mainWord.term;
                const basic = AppState.settings.basicMode;
                const colors = { 'n.': 'bg-dict-n', 'v.': 'bg-dict-v', 'adj.': 'bg-dict-adj', 'adv.': 'bg-dict-adv', 'phr.': 'bg-dict-phr', 'other': 'bg-gray-500' };
                const backHtml = entries.map(w => {
                    const bg = colors[w.pos] || 'bg-gray-500';
                    const ttsBtn = basic ? `<button onclick="Utils.speak('${w.def.replace(/'/g,"\\'")}', event)" class="ml-2 text-gray-400 hover:text-indigo-500"><i class="fas fa-volume-up text-sm"></i></button>` : '';
                    const exTtsBtn = basic && w.ex ? `<button onclick="Utils.speak('${w.ex.replace(/'/g,"\\'")}', event)" class="ml-2 text-gray-400 hover:text-indigo-500"><i class="fas fa-volume-up text-sm"></i></button>` : '';
                    return `<div class="mb-4 border-b border-gray-100 dark:border-gray-700 pb-4 last:border-0 last:pb-0"><div class="mb-2"><span class="${bg} text-white px-3 py-1 rounded-full text-sm font-bold shadow-sm uppercase">${w.pos}</span></div><div class="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2 leading-relaxed">${w.def} ${ttsBtn}</div>${w.ex ? `<div class="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl border-l-4 border-indigo-400 text-gray-600 dark:text-gray-300 italic text-base leading-relaxed">"${w.ex}" ${exTtsBtn}</div>` : ''}</div>`;
                }).join('');
                document.getElementById('card-back-content').innerHTML = backHtml;
                const avgLevel = Math.round(entries.reduce((a,b)=>a+(b.level||0),0)/entries.length);
                const lvlColors = ['text-red-400', 'text-orange-400', 'text-blue-400', 'text-green-400'];
                document.getElementById('card-front-status').innerHTML = `<i class="fas fa-circle ${lvlColors[avgLevel]} text-xs"></i>`;
                document.getElementById('review-progress').innerText = `${idx + 1} / ${q.length}`;
                const oldestReview = Math.min(...entries.map(e => e.lastReview || 0));
                const days = Math.floor((Date.now() - oldestReview) / 86400000);
                document.getElementById('card-last-review').innerText = days === 0 ? 'Today' : `${days}d ago`;
            },
            updateReviewFilters: () => {
                const icons = ['😫','😕','🙂','😎'], colors = ['bg-red-100 text-red-600','bg-orange-100 text-orange-600','bg-blue-100 text-blue-600','bg-green-100 text-green-600'];
                document.getElementById('filter-container').innerHTML = [0,1,2,3].map(i => `<button onclick="Controller.features.toggleFilter(${i})" class="w-8 h-8 rounded-full text-xs font-bold transition flex items-center justify-center ${AppState.review.filters.includes(i) ? colors[i] : 'bg-gray-100 text-gray-300 grayscale'}">${icons[i]}</button>`).join('');
            },
            toggleFilter: (i) => {
                const f = AppState.review.filters;
                AppState.review.filters = f.includes(i) ? f.filter(x => x !== i) : [...f, i];
                Controller.nav.review();
            },
            handleKey: (e) => {
                if (document.getElementById('view-review').classList.contains('hidden')) return;
                if (e.code === 'Space') { e.preventDefault(); Controller.features.flipCard(); }
                else if (e.code === 'ArrowRight') { AppState.review.index++; Controller.features.renderCard(); }
                else if (['Digit1','Digit2','Digit3','Digit4'].includes(e.code)) Controller.features.setRate({'Digit1':0,'Digit2':1,'Digit3':2,'Digit4':3}[e.code]);
            },
            timeTravel: (days) => {
                 UI.toast("時間旅行功能在雲端模式下已停用 (避免破壞資料)");
            },
            undoTimeTravel: () => { }
        },
        reader: {
            saveArticle: async () => {
                const id = document.getElementById('article-id').value;
                const title = document.getElementById('article-title').value.trim();
                const content = document.getElementById('article-content').value;
                if (!title || !content) { UI.toast('msg_empty'); return; }
                if (id) await Core.updateArticle(id, title, content); else await Core.addArticle(title, content);
                UI.toast('msg_saved'); Controller.nav.articlesList();
            },
            deleteArticle: async (id) => { if(confirm("Delete?")) { await Core.deleteArticle(id); UI.reader.renderArticleList(); } },
            toggleHighlight: async () => {
                AppState.settings.articleHighlight = !AppState.settings.articleHighlight;
                await Core.saveSettings();
                UI.reader.renderContent(AppState.currentArticleId);
            },
            clickWord: (el, word, index) => {
                const rect = el.getBoundingClientRect();
                const known = AppState.words.filter(w => w.term.toLowerCase() === word.toLowerCase());
                const sentence = Utils.getSentence(index, AppState.currentTokens);
                UI.reader.showPopup(rect, word, known, sentence);
            },
            quickAdd: async () => {
                const word = document.getElementById('popup-word').innerText;
                const def = document.getElementById('popup-input-def').value.trim();
                const ex = document.getElementById('popup-input-ex').value.trim();
                if (!def) { UI.toast('msg_empty'); return; }
                await Core.addWord({ term: word, pos: 'n.', def: def, ex: ex }); 
                UI.toast('Added!'); UI.reader.hidePopup();
                UI.reader.renderContent(AppState.currentArticleId);
            },
            clearEx: () => { document.getElementById('popup-input-ex').value = ""; },
            restoreEx: () => { document.getElementById('popup-input-ex').value = AppState.tempSentence || ""; },
            useSelection: () => {
                const sel = window.getSelection().toString();
                if (sel.trim()) { document.getElementById('popup-input-ex').value = sel.trim(); } 
                else { UI.toast("請先在文章中反白文字"); }
            },
            openCambridge: () => {
                const word = document.getElementById('popup-word').innerText.trim();
                if (word) {
                    window.open(`https://dictionary.cambridge.org/dictionary/english/${encodeURIComponent(word)}`, '_blank');
                }
            },
            playArticle: (startIdx = 0) => {
                const article = AppState.articles.find(a => a.id === AppState.currentArticleId);
                if (!article || !article.content) return;
                
                const rawSentences = article.content.match(/[^.!?\n]+[.!?]?/g) || [article.content];
                const cleanSentences = rawSentences.map(s => s.trim()).filter(s => s.length > 0);
                if (!cleanSentences.length) return;
                
                AppState.reader.sentences = cleanSentences;
                AppState.reader.currentSentenceIdx = startIdx;
                AppState.reader.isPlaying = true;
                AppState.reader.isPaused = false;
                UI.reader.updatePlayButton(true);
                
                Controller.reader.speakNextSentence();
            },
            speakNextSentence: () => {
                if (!AppState.reader.isPlaying || AppState.reader.isPaused) return;
                if (!AppState.reader.sentences || AppState.reader.currentSentenceIdx >= AppState.reader.sentences.length) {
                    Controller.reader.stopArticle();
                    return;
                }
                
                const text = AppState.reader.sentences[AppState.reader.currentSentenceIdx];
                window.speechSynthesis.cancel();
                
                const u = new SpeechSynthesisUtterance(text);
                u.lang = 'en-US';
                u.rate = AppState.reader.speed || 1.0;
                
                u.onend = () => {
                    if (!AppState.reader.isPlaying || AppState.reader.isPaused) return;
                    AppState.reader.currentSentenceIdx++;
                    Controller.reader.speakNextSentence();
                };
                
                u.onerror = (err) => {
                    if (err.error !== 'interrupted' && err.error !== 'canceled') {
                        AppState.reader.currentSentenceIdx++;
                        Controller.reader.speakNextSentence();
                    }
                };
                
                speechSynthesis.speak(u);
            },
            stopArticle: () => {
                window.speechSynthesis.cancel();
                AppState.reader.isPlaying = false;
                AppState.reader.isPaused = false;
                AppState.reader.currentSentenceIdx = 0;
                UI.reader.updatePlayButton(false);
            },
            togglePlay: () => {
                if (!AppState.reader.isPlaying) {
                    Controller.reader.playArticle(0);
                } else if (!AppState.reader.isPaused) {
                    window.speechSynthesis.cancel();
                    AppState.reader.isPaused = true;
                    UI.reader.updatePlayButton(false);
                } else {
                    AppState.reader.isPaused = false;
                    UI.reader.updatePlayButton(true);
                    Controller.reader.speakNextSentence();
                }
            },
            setSpeed: (val) => {
                AppState.reader.speed = parseFloat(val) || 1.0;
                if (AppState.reader.isPlaying && !AppState.reader.isPaused) {
                    Controller.reader.speakNextSentence();
                }
            }
        }
    };

    // --- Expose to Window for HTML Handlers ---
    window.Controller = Controller;
    window.UI = UI;
    window.Utils = Utils;
    window.AppState = AppState;

    // Start App
    Controller.init();