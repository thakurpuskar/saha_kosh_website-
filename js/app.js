document.addEventListener('DOMContentLoaded', function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var appShell = document.querySelector('.app-shell');
  var pageTitleEl = document.querySelector('.page-title');
  var pageTitle = pageTitleEl ? pageTitleEl.textContent : '';
  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function prependHtml(container, htmlArray) {
    if (!container || !htmlArray || !htmlArray.length) return;
    container.insertAdjacentHTML('afterbegin', htmlArray.join(''));
  }
  function showToast(label) {
    var stack = document.querySelector('.toast-stack');
    if (!stack) {
      stack = document.createElement('div');
      stack.className = 'toast-stack';
      document.body.appendChild(stack);
    }
    var t = document.createElement('div');
    t.className = 'toast';
    t.textContent = label;
    stack.appendChild(t);
    requestAnimationFrame(function () { t.classList.add('show'); });
    setTimeout(function () {
      t.classList.remove('show');
      setTimeout(function () { t.remove(); }, 300);
    }, 2800);
  }
  function incrementKpiByLabel(labelSubstring, amount) {
    document.querySelectorAll('.kpi-label').forEach(function (label) {
      if (label.textContent.toLowerCase().indexOf(labelSubstring.toLowerCase()) !== -1) {
        var card = label.closest('.kpi');
        var valueEl = card ? card.querySelector('.kpi-value') : null;
        if (valueEl) {
          var raw = valueEl.textContent.trim().replace(/,/g, '');
          var n = parseInt(raw, 10);
          if (!isNaN(n)) valueEl.textContent = (n + amount).toLocaleString('en-US');
        }
      }
    });
  }
  document.querySelectorAll('.tabs').forEach(function (tabGroup) {
    tabGroup.querySelectorAll('a').forEach(function (tab) {
      tab.addEventListener('click', function (e) {
        if (tab.getAttribute('href') === '#') e.preventDefault();
        tabGroup.querySelectorAll('a').forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');
      });
    });
  });
  document.querySelectorAll('.tabs[data-panel-group]').forEach(function (tabGroup) {
    var group = tabGroup.getAttribute('data-panel-group');
    var panelWrap = document.querySelector('[data-panel-content="' + group + '"]');
    if (!panelWrap) return;
    tabGroup.querySelectorAll('a[data-panel]').forEach(function (tab) {
      tab.addEventListener('click', function () {
        var target = tab.getAttribute('data-panel');
        panelWrap.querySelectorAll('[data-panel]').forEach(function (panel) {
          panel.hidden = panel.getAttribute('data-panel') !== target;
        });
      });
    });
  });
  document.querySelectorAll('[data-toggle]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var target = document.querySelector(btn.getAttribute('data-toggle'));
      if (target) target.classList.toggle('open');
    });
  });
  var themeToggle = document.querySelector('[data-theme-toggle]');
  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      var next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try { window.localStorage.setItem('sahakosh_theme', next); } catch (e) {}
    });
  }
  var navToggle = document.querySelector('[data-toggle-sidebar]');
  var overlay = document.querySelector('[data-sidebar-overlay]');
  if (appShell && navToggle) navToggle.addEventListener('click', function () { appShell.classList.toggle('sidebar-open'); });
  if (appShell && overlay) overlay.addEventListener('click', function () { appShell.classList.remove('sidebar-open'); });
  document.querySelectorAll('.sidebar-nav a').forEach(function (link) {
    link.addEventListener('click', function () { if (appShell) appShell.classList.remove('sidebar-open'); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && appShell) appShell.classList.remove('sidebar-open');
  });
  function renderMemberRow(m) {
    var initials = (m.name || 'NM').split(/\s+/).filter(Boolean).map(function (p) { return p[0]; }).join('').slice(0, 2).toUpperCase() || 'NM';
    return '<tr class="row-new">' +
      '<td style="color:var(--blue-700);font-weight:700;">' + escapeHtml(m.id) + '</td>' +
      '<td><div style="display:flex;align-items:center;gap:8px;"><span style="width:32px;height:32px;border-radius:12px;background:var(--blue-100b);display:inline-flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:var(--blue-700);">' + initials + '</span><strong>' + escapeHtml(m.name) + '</strong></div></td>' +
      '<td>' + escapeHtml(m.branch) + '</td>' +
      '<td>' + escapeHtml(m.phone) + '</td>' +
      '<td><strong>' + escapeHtml(m.balance) + '</strong></td>' +
      '<td><span class="chip ' + escapeHtml(m.loanChip || 'grey') + '">' + escapeHtml(m.loanStatus || 'None') + '</span></td>' +
      '<td>' + escapeHtml(m.verification || '○ Pending') + '</td>' +
      '<td style="text-align:right;"><a href="member-profile.html?id=' + encodeURIComponent(m.id) + '" style="color:var(--blue-700);font-weight:700;font-size:12px;">View Details</a></td>' +
      '</tr>';
  }
  function renderTransactionRow(t) {
    return '<tr class="row-new">' +
      '<td>' + escapeHtml(t.ref) + '</td>' +
      '<td>' + escapeHtml(t.member) + '</td>' +
      '<td>' + escapeHtml(t.type) + '</td>' +
      '<td>Rs. ' + escapeHtml(t.amountFmt) + '</td>' +
      '<td>Just now</td>' +
      '<td><span class="chip green">Success</span></td>' +
      '</tr>';
  }
  function renderDepositRow(d) {
    return '<tr class="row-new">' +
      '<td>' + escapeHtml(d.depositor) + '</td>' +
      '<td>' + escapeHtml(d.account) + '</td>' +
      '<td>Rs. ' + escapeHtml(d.amountFmt) + '</td>' +
      '<td>' + escapeHtml(d.method) + '</td>' +
      '<td><span class="chip amber">Pending</span></td>' +
      '</tr>';
  }
  function renderEventCard(e) {
    return '<div class="card row-new" style="overflow:hidden;">' +
      '<div style="height:120px;background:' + e.gradient + ';"></div>' +
      '<div style="padding:17px;">' +
      '<div style="font-weight:700;margin-bottom:4px;">' + escapeHtml(e.title) + '</div>' +
      '<div style="font-size:13px;color:var(--text-muted);margin-bottom:8px;">' + escapeHtml(e.date) + ' · ' + escapeHtml(e.location) + '</div>' +
      '<span class="chip blue">' + escapeHtml(String(e.rsvps || 0)) + ' RSVPs</span>' +
      '</div></div>';
  }
  function renderProductCard(p) {
    var stockChip = p.stock === 'Low Stock' ? 'amber' : (p.stock === 'Out of Stock' ? 'red' : 'green');
    return '<div class="card row-new" style="padding:17px;">' +
      '<div style="height:120px;background:var(--blue-50);border-radius:4px;margin-bottom:12px;display:flex;align-items:center;justify-content:center;font-size:32px;">' + escapeHtml(p.icon || '📦') + '</div>' +
      '<div style="font-weight:700;">' + escapeHtml(p.name) + '</div>' +
      '<div style="font-size:13px;color:var(--text-muted);">' + escapeHtml(p.seller) + '</div>' +
      '<div style="display:flex;justify-content:space-between;margin-top:8px;"><strong>Rs. ' + escapeHtml(p.priceFmt) + '</strong><span class="chip ' + stockChip + '">' + escapeHtml(p.stock) + '</span></div>' +
      '</div>';
  }
  function renderCampaignCard(c) {
    var urgencyChip = c.urgency === 'Urgent' ? 'red' : 'blue';
    return '<div class="card panel row-new">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;"><h3 class="panel-h3">' + escapeHtml(c.name) + '</h3><span class="chip ' + urgencyChip + '">' + escapeHtml(c.urgency) + '</span></div>' +
      '<div style="font-size:24px;font-weight:700;color:var(--blue-700);margin-bottom:4px;">Rs. 0 <span style="font-size:13px;font-weight:400;color:var(--text-muted);">of Rs. ' + escapeHtml(c.goalFmt) + '</span></div>' +
      '<div class="progress-track" style="margin-bottom:8px;"><div class="progress-fill" style="width:0%;"></div></div>' +
      '<div style="font-size:13px;color:var(--text-muted);">0 donors · ' + escapeHtml(String(c.daysLeft || 30)) + ' days left</div>' +
      '</div>';
  }
  function renderOpportunityCard(o) {
    return '<div class="card panel row-new">' +
      '<div class="panel-title" style="margin-bottom:8px;">' + escapeHtml(o.type) + '</div>' +
      '<div style="font-weight:700;">' + escapeHtml(o.title) + '</div>' +
      '<div style="font-size:13px;color:var(--text-muted);margin:4px 0;">' + escapeHtml(o.details) + '</div>' +
      '<span class="chip green">' + (o.extra ? escapeHtml(o.extra) : 'New') + '</span>' +
      '</div>';
  }
  var SK = window.SahaKosh;
  if (SK) {
    if (/Member Records/i.test(pageTitle)) {
      var mTbody = document.querySelector('.card.table-wrap table tbody');
      var custom = SK.getCustomMembers().reverse();
      if (mTbody && custom.length) prependHtml(mTbody, custom.map(renderMemberRow));
    }
    if (/Transaction (Management|Ledger)/i.test(pageTitle)) {
      var tTbody = document.querySelector('.card.table-wrap table tbody');
      var txns = SK.getEntries('transactions');
      if (tTbody && txns.length) prependHtml(tTbody, txns.map(renderTransactionRow));
    }
    if (/Deposit Management/i.test(pageTitle)) {
      var dTbody = document.querySelector('.card.table-wrap table tbody');
      var deps = SK.getEntries('deposits');
      if (dTbody && deps.length) prependHtml(dTbody, deps.map(renderDepositRow));
    }
    if (/Community/i.test(pageTitle)) {
      var evGrid = document.querySelector('.grid-3');
      var evs = SK.getEntries('events');
      if (evGrid && evs.length) { prependHtml(evGrid, evs.map(renderEventCard)); incrementKpiByLabel('Upcoming Events', evs.length); }
    }
    if (/Marketplace/i.test(pageTitle)) {
      var prGrid = document.querySelector('.grid-3');
      var prods = SK.getEntries('products');
      if (prGrid && prods.length) { prependHtml(prGrid, prods.map(renderProductCard)); incrementKpiByLabel('Listed Products', prods.length); }
    }
    if (/Donations/i.test(pageTitle)) {
      var caGrid = document.querySelector('.grid-2');
      var camps = SK.getEntries('campaigns');
      if (caGrid && camps.length) { prependHtml(caGrid, camps.map(renderCampaignCard)); incrementKpiByLabel('Active Campaigns', camps.length); }
    }
    if (/Opportunities/i.test(pageTitle)) {
      var opGrid = document.querySelector('.grid-3');
      var opps = SK.getEntries('opportunities');
      if (opGrid && opps.length) { prependHtml(opGrid, opps.map(renderOpportunityCard)); incrementKpiByLabel('Open Opportunities', opps.length); }
    }
  }
  if (!reduceMotion && 'IntersectionObserver' in window) {
    document.querySelectorAll('.kpi-value').forEach(function (el) {
      var raw = el.textContent.trim();
      if (/^[0-9][0-9,]*$/.test(raw)) {
        var end = parseInt(raw.replace(/,/g, ''), 10);
        if (!isNaN(end) && end > 0) {
          el.textContent = '0';
          var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) { animateValue(el, end, 800); observer.unobserve(entry.target); }
            });
          }, { threshold: 0.3 });
          observer.observe(el);
        }
      }
    });
  }
  function animateValue(el, end, duration) {
    var startTime = null;
    function step(ts) {
      if (!startTime) startTime = ts;
      var progress = Math.min((ts - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * end).toLocaleString('en-US');
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = end.toLocaleString('en-US');
    }
    requestAnimationFrame(step);
  }
  var MODAL_DEFS = [
    { name: 'add-member', triggers: ['add member'], title: 'Add New Member', subtitle: 'Register a new member and open their savings account.', submitLabel: 'Add Member',
      fields: [
        { name: 'name', label: 'Full Name', type: 'text', required: true, placeholder: 'e.g. Sunita Lama' },
        { name: 'phone', label: 'Phone Number', type: 'tel', required: true, placeholder: '+977 98XX-XXXXXX' },
        { name: 'branch', label: 'Branch', type: 'select', required: true, options: ['Itahari Branch', 'Kathmandu Branch', 'Lalitpur Branch', 'Panchthar Branch', 'Pokhara Branch', 'Dhankuta Branch', 'Inaruwa Branch'] },
        { name: 'scheme', label: 'Savings Scheme', type: 'select', options: ['Regular Savings', 'Fixed Deposit', 'Group / Cooperative'] },
        { name: 'deposit', label: 'Initial Deposit (NPR)', type: 'number', placeholder: '0.00' },
        { name: 'nominee', label: 'Nominee', type: 'text', placeholder: 'Full name' }
      ] },
    { name: 'new-transaction', triggers: ['new transaction'], title: 'New Transaction', subtitle: 'Record a deposit, withdrawal, or EMI payment.', submitLabel: 'Record Transaction',
      fields: [
        { name: 'member', label: 'Member / Account', type: 'text', required: true, full: true, placeholder: 'e.g. Sanjeev Shrestha — SB-44201' },
        { name: 'type', label: 'Transaction Type', type: 'select', required: true, options: ['Savings Deposit', 'Withdrawal', 'Loan EMI', 'Bulk Deposit'] },
        { name: 'amount', label: 'Amount (NPR)', type: 'number', required: true, placeholder: '0.00' },
        { name: 'method', label: 'Method', type: 'select', options: ['Cash', 'Bank Transfer', 'Mobile Wallet'] },
        { name: 'note', label: 'Reference Note', type: 'text', placeholder: 'Optional' }
      ] },
    { name: 'new-deposit', triggers: ['new deposit', 'record deposit'], title: 'New Deposit', subtitle: 'Record a savings deposit for a member or group.', submitLabel: 'Record Deposit',
      fields: [
        { name: 'depositor', label: 'Depositor Name', type: 'text', required: true, full: true, placeholder: 'e.g. Sanjeev Shrestha or Agriculture Group B' },
        { name: 'account', label: 'Account No.', type: 'text', required: true, placeholder: 'e.g. SB-44201' },
        { name: 'amount', label: 'Amount (NPR)', type: 'number', required: true, placeholder: '0.00' },
        { name: 'method', label: 'Method', type: 'select', options: ['Cash', 'Bank Transfer', 'Mobile Wallet'] }
      ] },
    { name: 'new-event', triggers: ['new event'], title: 'New Event', subtitle: 'Create a community event or workshop.', submitLabel: 'Create Event',
      fields: [
        { name: 'title', label: 'Event Name', type: 'text', required: true, full: true, placeholder: 'e.g. Financial Literacy Workshop' },
        { name: 'date', label: 'Date', type: 'text', required: true, placeholder: 'e.g. Sep 12, 2026' },
        { name: 'location', label: 'Location', type: 'text', required: true, placeholder: 'e.g. Itahari Community Hall' },
        { name: 'category', label: 'Category', type: 'select', options: ['General', 'Training', 'Social'] },
        { name: 'rsvps', label: 'Expected RSVPs', type: 'number', placeholder: '0' }
      ] },
    { name: 'list-product', triggers: ['list product'], title: 'List New Product', subtitle: 'Add a product to the community marketplace.', submitLabel: 'List Product',
      fields: [
        { name: 'name', label: 'Product Name', type: 'text', required: true, full: true, placeholder: 'e.g. Organic Rice — 25kg' },
        { name: 'seller', label: 'Seller / Group', type: 'text', required: true, placeholder: 'e.g. Agriculture Group B' },
        { name: 'price', label: 'Price (NPR)', type: 'number', required: true, placeholder: '0.00' },
        { name: 'stock', label: 'Stock Status', type: 'select', options: ['In Stock', 'Low Stock', 'Out of Stock'] },
        { name: 'icon', label: 'Icon (emoji)', type: 'text', placeholder: 'e.g. 🌾' }
      ] },
    { name: 'new-campaign', triggers: ['new campaign'], title: 'New Campaign', subtitle: 'Launch a fundraising or donation campaign.', submitLabel: 'Launch Campaign',
      fields: [
        { name: 'name', label: 'Campaign Name', type: 'text', required: true, full: true, placeholder: 'e.g. Winter Relief Fund' },
        { name: 'goal', label: 'Goal Amount (NPR)', type: 'number', required: true, placeholder: '0.00' },
        { name: 'urgency', label: 'Urgency', type: 'select', options: ['Urgent', 'Ongoing'] },
        { name: 'daysLeft', label: 'Days Left', type: 'number', placeholder: '30' }
      ] },
    { name: 'post-opportunity', triggers: ['post opportunity'], title: 'Post Opportunity', subtitle: 'Share a job, training, or grant with members.', submitLabel: 'Post Opportunity',
      fields: [
        { name: 'type', label: 'Type', type: 'select', required: true, options: ['Job Listing', 'Skill Training', 'Micro-grant'] },
        { name: 'title', label: 'Title', type: 'text', required: true, full: true, placeholder: 'e.g. Agri-supply Coordinator' },
        { name: 'details', label: 'Details', type: 'text', required: true, full: true, placeholder: 'e.g. Itahari Branch · Full-time' },
        { name: 'extra', label: 'Extra Info', type: 'text', placeholder: 'e.g. 12 applicants / Up to Rs. 50,000' }
      ] }
  ];
  var modalOverlay = document.createElement('div');
  modalOverlay.className = 'modal-overlay';
  modalOverlay.setAttribute('data-modal-overlay', '');
  modalOverlay.innerHTML = MODAL_DEFS.map(function (def) {
    var fieldsHtml = def.fields.map(function (f) {
      var spanStyle = f.full ? ' style="grid-column:1 / -1;"' : '';
      var reqAttr = f.required ? ' required' : '';
      var input;
      if (f.type === 'select') {
        input = '<select name="' + f.name + '"' + reqAttr + '>' + (f.required ? '<option value="">Select</option>' : '') +
          f.options.map(function (o) { return '<option>' + o + '</option>'; }).join('') + '</select>';
      } else {
        input = '<input type="' + f.type + '" name="' + f.name + '"' + reqAttr +
          (f.type === 'number' ? ' min="0" step="0.01"' : '') +
          (f.placeholder ? ' placeholder="' + f.placeholder + '"' : '') + '>';
      }
      return '<div class="form-row"' + spanStyle + '><label>' + f.label + (f.required ? ' *' : '') + '</label>' + input + '</div>';
    }).join('');
    return '<div class="modal" data-modal="' + def.name + '" role="dialog" aria-modal="true">' +
      '<div class="modal-head"><div><h3>' + def.title + '</h3><p>' + def.subtitle + '</p></div>' +
      '<button type="button" class="modal-close" data-modal-close aria-label="Close">&times;</button></div>' +
      '<form class="modal-body" data-form="' + def.name + '" novalidate><div class="form-grid">' + fieldsHtml + '</div>' +
      '<div class="modal-actions"><button type="button" class="btn btn-outline" data-modal-close style="background:#fff;color:var(--text-secondary);">Cancel</button>' +
      '<button type="submit" class="btn btn-primary">' + def.submitLabel + '</button></div></form></div>';
  }).join('');
  document.body.appendChild(modalOverlay);
  var lastFocused = null;
  function openModal(name) {
    lastFocused = document.activeElement;
    modalOverlay.querySelectorAll('.modal').forEach(function (m) {
      m.classList.remove('is-shown');
      m.classList.toggle('is-active', m.getAttribute('data-modal') === name);
    });
    modalOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    var active = modalOverlay.querySelector('.modal.is-active');
    requestAnimationFrame(function () { requestAnimationFrame(function () { if (active) active.classList.add('is-shown'); }); });
    if (active) {
      var firstField = active.querySelector('input, select, textarea');
      if (firstField) setTimeout(function () { firstField.focus(); }, 60);
    }
  }
  function closeModal() {
    modalOverlay.classList.remove('open');
    document.body.style.overflow = '';
    modalOverlay.querySelectorAll('.modal').forEach(function (m) { m.classList.remove('is-active', 'is-shown'); });
    modalOverlay.querySelectorAll('form').forEach(function (f) { f.reset(); });
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }
  modalOverlay.addEventListener('click', function (e) { if (e.target === modalOverlay) closeModal(); });
  modalOverlay.querySelectorAll('[data-modal-close]').forEach(function (btn) { btn.addEventListener('click', closeModal); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && modalOverlay.classList.contains('open')) closeModal(); });
  document.querySelectorAll('button, a.btn, a.btn-primary, a.btn-outline, a.btn-ghost').forEach(function (btn) {
    if (btn.hasAttribute('data-modal-trigger')) return;
    var text = btn.textContent.trim().toLowerCase();
    for (var i = 0; i < MODAL_DEFS.length; i++) {
      var def = MODAL_DEFS[i];
      if (def.triggers.some(function (kw) { return text.indexOf(kw) !== -1; })) {
        btn.setAttribute('data-modal-trigger', def.name);
        btn.addEventListener('click', function (e) { e.preventDefault(); openModal(def.name); });
        break;
      }
    }
  });
  var onSubmitHandlers = {
    'add-member': function (fd) {
      if (!SK) return;
      var member = SK.addMember({ name: fd.get('name'), phone: fd.get('phone'), branch: fd.get('branch'), scheme: fd.get('scheme'), deposit: fd.get('deposit'), nominee: fd.get('nominee') });
      if (/Member Records/i.test(pageTitle)) {
        var tbody = document.querySelector('.card.table-wrap table tbody');
        if (tbody) prependHtml(tbody, [renderMemberRow(member)]);
      }
      showToast(member.name + ' added to ' + member.branch + ' — saved');
    },
    'new-transaction': function (fd) {
      if (!SK) return;
      var amount = parseFloat(fd.get('amount') || '0') || 0;
      var t = SK.addEntry('transactions', { ref: 'TXN-' + Math.floor(50000 + Math.random() * 9000), member: fd.get('member') || 'Walk-in', type: fd.get('type') || 'Transaction', amountFmt: amount.toLocaleString('en-US', { minimumFractionDigits: 2 }), method: fd.get('method') });
      if (/Transaction (Management|Ledger)/i.test(pageTitle)) {
        var tbody = document.querySelector('.card.table-wrap table tbody');
        if (tbody) prependHtml(tbody, [renderTransactionRow(t)]);
      }
      showToast(t.type + ' of NPR ' + t.amountFmt + ' recorded for ' + t.member + ' — saved');
    },
    'new-deposit': function (fd) {
      if (!SK) return;
      var amount = parseFloat(fd.get('amount') || '0') || 0;
      var d = SK.addEntry('deposits', { depositor: fd.get('depositor') || 'Unnamed', account: fd.get('account') || '—', amountFmt: amount.toLocaleString('en-US', { minimumFractionDigits: 2 }), method: fd.get('method') });
      if (/Deposit Management/i.test(pageTitle)) {
        var tbody = document.querySelector('.card.table-wrap table tbody');
        if (tbody) prependHtml(tbody, [renderDepositRow(d)]);
      }
      showToast('Deposit of NPR ' + d.amountFmt + ' recorded for ' + d.depositor + ' — saved');
    },
    'new-event': function (fd) {
      if (!SK) return;
      var category = fd.get('category') || 'General';
      var gradients = { General: 'linear-gradient(135deg,#003d9b,#0865f5)', Training: 'linear-gradient(135deg,#006c49,#6cf8bb)', Social: 'linear-gradient(135deg,#603b00,#ffc988)' };
      var e = SK.addEntry('events', { title: fd.get('title') || 'New Event', date: fd.get('date') || 'TBA', location: fd.get('location') || '—', category: category, gradient: gradients[category] || gradients.General, rsvps: fd.get('rsvps') || 0 });
      if (/Community/i.test(pageTitle)) {
        var grid = document.querySelector('.grid-3');
        if (grid) { prependHtml(grid, [renderEventCard(e)]); incrementKpiByLabel('Upcoming Events', 1); }
      }
      showToast('"' + e.title + '" added to Community events — saved');
    },
    'list-product': function (fd) {
      if (!SK) return;
      var price = parseFloat(fd.get('price') || '0') || 0;
      var p = SK.addEntry('products', { name: fd.get('name') || 'New Product', seller: fd.get('seller') || '—', priceFmt: price.toLocaleString('en-US'), stock: fd.get('stock') || 'In Stock', icon: fd.get('icon') || '📦' });
      if (/Marketplace/i.test(pageTitle)) {
        var grid = document.querySelector('.grid-3');
        if (grid) { prependHtml(grid, [renderProductCard(p)]); incrementKpiByLabel('Listed Products', 1); }
      }
      showToast(p.name + ' listed on the Marketplace — saved');
    },
    'new-campaign': function (fd) {
      if (!SK) return;
      var goal = parseFloat(fd.get('goal') || '0') || 0;
      var c = SK.addEntry('campaigns', { name: fd.get('name') || 'New Campaign', goalFmt: goal.toLocaleString('en-US'), urgency: fd.get('urgency') || 'Ongoing', daysLeft: fd.get('daysLeft') || 30 });
      if (/Donations/i.test(pageTitle)) {
        var grid = document.querySelector('.grid-2');
        if (grid) { prependHtml(grid, [renderCampaignCard(c)]); incrementKpiByLabel('Active Campaigns', 1); }
      }
      showToast('"' + c.name + '" campaign launched — saved');
    },
    'post-opportunity': function (fd) {
      if (!SK) return;
      var o = SK.addEntry('opportunities', { type: fd.get('type') || 'Job Listing', title: fd.get('title') || 'New Opportunity', details: fd.get('details') || '', extra: fd.get('extra') || '' });
      if (/Opportunities/i.test(pageTitle)) {
        var grid = document.querySelector('.grid-3');
        if (grid) { prependHtml(grid, [renderOpportunityCard(o)]); incrementKpiByLabel('Open Opportunities', 1); }
      }
      showToast('"' + o.title + '" posted to Opportunities — saved');
    }
  };
  modalOverlay.querySelectorAll('form[data-form]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var name = form.getAttribute('data-form');
      var fd = new FormData(form);
      if (onSubmitHandlers[name]) onSubmitHandlers[name](fd);
      closeModal();
    });
  });
  var loanFilterBtns = document.querySelectorAll('.loan-filter-btn');
  if (loanFilterBtns.length) {
    loanFilterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        loanFilterBtns.forEach(function (b) {
          b.classList.remove('active');
          b.style.background = '';
          b.style.color = '';
          b.style.fontWeight = '';
        });
        btn.classList.add('active');
        btn.style.background = 'var(--blue-100b)';
        btn.style.color = 'var(--blue-700)';
        btn.style.fontWeight = '700';
        var filter = btn.getAttribute('data-filter');
        var rows = document.querySelectorAll('table tbody tr[data-status]');
        var visible = 0;
        rows.forEach(function (row) {
          var status = row.getAttribute('data-status');
          var show = filter === 'all' || (filter === 'pending' && status === 'review') || (filter === 'overdue' && status === 'overdue');
          row.style.display = show ? '' : 'none';
          if (show) visible++;
        });
        var showingEl = document.querySelector('[data-loan-showing]');
        if (showingEl) showingEl.textContent = 'Showing ' + visible + ' of 482 loans';
      });
    });
  }
  var REPORT_CONTENT = {
    'Monthly Financial Summary': ['Total Savings Pool: Rs. 4.2M (+ Rs. 450K month-over-month)', 'Total Loans Disbursed: रू 12.4M', 'Total Collections This Month: Rs. 1.8M', 'Net Interest Income: Rs. 168K year-to-date'],
    'Branch Performance Report': ['Itahari Branch — Rs. 1.4M savings, 96% collection rate', 'Kathmandu Branch — Rs. 1.1M savings, 91% collection rate', 'Lalitpur Branch — Rs. 900K savings, 94% collection rate', 'Top performer this quarter: Itahari Branch'],
    'Regulatory Compliance Report': ['Audit Score: 98 / 100', 'Compliance Checks Passed: 142 this month', 'Flagged Transactions Under Review: 3', 'Last Full Audit: Aug 1, 2026']
  };
  var reportButtons = Array.prototype.filter.call(document.querySelectorAll('.content .btn'), function (b) { return b.textContent.trim() === 'Generate'; });
  if (reportButtons.length) {
    var reportOverlay = document.createElement('div');
    reportOverlay.className = 'modal-overlay';
    reportOverlay.innerHTML = '<div class="modal is-active" role="dialog" aria-modal="true">' +
      '<div class="modal-head"><div><h3 id="reportModalTitle">Report</h3><p id="reportModalDate"></p></div>' +
      '<button type="button" class="modal-close" data-report-close aria-label="Close">&times;</button></div>' +
      '<div class="modal-body" id="reportModalBody"></div>' +
      '<div class="modal-actions" style="padding:0 24px 24px;"><button type="button" class="btn btn-outline" data-report-close style="background:#fff;color:var(--text-secondary);">Close</button>' +
      '<button type="button" class="btn btn-primary" id="reportPrintBtn">Print / Save as PDF</button></div></div>';
    document.body.appendChild(reportOverlay);
    function openReport(name) {
      reportOverlay.querySelector('#reportModalTitle').textContent = name;
      reportOverlay.querySelector('#reportModalDate').textContent = 'Generated ' + new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      var lines = REPORT_CONTENT[name] || ['Report data is being compiled for this section.'];
      reportOverlay.querySelector('#reportModalBody').innerHTML = '<ul style="margin:0;padding-left:20px;display:flex;flex-direction:column;gap:10px;font-size:14px;">' + lines.map(function (l) { return '<li>' + escapeHtml(l) + '</li>'; }).join('') + '</ul>';
      reportOverlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function closeReport() { reportOverlay.classList.remove('open'); document.body.style.overflow = ''; }
    reportOverlay.addEventListener('click', function (e) { if (e.target === reportOverlay) closeReport(); });
    reportOverlay.querySelectorAll('[data-report-close]').forEach(function (b) { b.addEventListener('click', closeReport); });
    reportOverlay.querySelector('#reportPrintBtn').addEventListener('click', function () { window.print(); });
    reportButtons.forEach(function (btn) {
      var panel = btn.closest('.panel');
      var titleEl = panel ? panel.querySelector('h3') : null;
      var name = titleEl ? titleEl.textContent.trim() : 'Report';
      btn.setAttribute('data-report-trigger', name);
      btn.addEventListener('click', function (e) { e.preventDefault(); openReport(name); });
    });
  }
  document.querySelectorAll('[data-href]').forEach(function (row) {
    row.addEventListener('click', function () { window.location.href = row.getAttribute('data-href'); });
    row.setAttribute('tabindex', '0');
    row.setAttribute('role', 'link');
    row.addEventListener('keydown', function (e) { if (e.key === 'Enter') window.location.href = row.getAttribute('data-href'); });
  });
  document.querySelectorAll('.role-row').forEach(function (row) {
    row.addEventListener('click', function () {
      var name = row.querySelector('strong') ? row.querySelector('strong').textContent : 'Role';
      showToast(name + ' — permissions panel (demo)');
    });
  });
  document.querySelectorAll('.content .btn').forEach(function (btn) {
    if (btn.hasAttribute('data-toggle') || btn.hasAttribute('data-modal-trigger') || btn.hasAttribute('data-report-trigger') || btn.classList.contains('loan-filter-btn') || btn.closest('.tabs')) return;
    btn.addEventListener('click', function () {
      var label = btn.textContent.trim().replace(/^[+✓↓]\s*/, '') || 'Action';
      showToast(label + ' — saved (demo)');
    });
  });
});