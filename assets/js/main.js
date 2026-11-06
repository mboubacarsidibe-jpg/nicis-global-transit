(function () {
var d = document, w = window, root = d.documentElement;
root.classList.add('js');
var $ = function (s, c) { return (c || d).querySelector(s); };
var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
var CFG = w.NICIS || {};
var hdr = $('.hdr');
if (hdr) {
var onS = function () { hdr.classList.toggle('is-stuck', w.scrollY > 40); };
onS(); w.addEventListener('scroll', onS, { passive: true });
}
$$('[data-mega]').forEach(function (btn) {
var panel = d.getElementById(btn.getAttribute('aria-controls')), t;
if (!panel) return;
var open = function (v) { btn.setAttribute('aria-expanded', v); panel.classList.toggle('is-open', v); };
btn.addEventListener('click', function () { open(btn.getAttribute('aria-expanded') !== 'true'); });
[btn, panel].forEach(function (el) {
el.addEventListener('mouseenter', function () { if (w.matchMedia('(hover:hover)').matches) { clearTimeout(t); open(true); } });
el.addEventListener('mouseleave', function () { t = setTimeout(function () { open(false); }, 180); });
});
d.addEventListener('keydown', function (e) { if (e.key === 'Escape') { open(false); } });
d.addEventListener('click', function (e) { if (!panel.contains(e.target) && !btn.contains(e.target)) open(false); });
});
var drawer = $('.drawer'), burger = $('.burger');
if (drawer && burger) {
var setD = function (v) {
drawer.classList.toggle('is-open', v); burger.setAttribute('aria-expanded', v);
drawer.setAttribute('aria-hidden', !v); d.body.classList.toggle('no-scroll', v);
if (v) { var c = $('.drawer__close'); c && c.focus(); } else burger.focus();
};
burger.addEventListener('click', function () { setD(true); });
$('.drawer__close').addEventListener('click', function () { setD(false); });
d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && drawer.classList.contains('is-open')) setD(false); });
}
var qw = $('.qw');
if (qw) {
var tabs = $$('.qw__tabs button', qw), typeIn = $('input[name="type"]', qw);
tabs.forEach(function (b) {
b.addEventListener('click', function () {
tabs.forEach(function (x) { x.setAttribute('aria-selected', x === b); });
typeIn.value = b.dataset.type;
var o = $('[name="from"]', qw), de = $('[name="to"]', qw);
if (b.dataset.type === 'Export') { o.placeholder = 'Abidjan, Côte d\'Ivoire'; de.placeholder = 'Ex. Rotterdam, Pays-Bas'; }
else if (b.dataset.type === 'Transit') { o.placeholder = 'Ex. Shanghai, Chine'; de.placeholder = 'Ex. Bamako, Mali'; }
else { o.placeholder = 'Ex. Anvers, Belgique'; de.placeholder = 'Abidjan, Côte d\'Ivoire'; }
});
});
}
var form = $('#devis-form');
if (form) {
var q = new URLSearchParams(w.location.search), parts = [];
['type', 'mode', 'from', 'to', 'goods'].forEach(function (k) {
var v = q.get(k); if (!v) return;
var el = form.elements[k]; if (el) el.value = v;
});
if (q.get('type')) parts.push('Opération : ' + q.get('type'));
if (q.get('from')) parts.push('Origine : ' + q.get('from'));
if (q.get('to')) parts.push('Destination : ' + q.get('to'));
if (q.get('mode')) parts.push('Mode : ' + q.get('mode'));
if (q.get('goods')) parts.push('Marchandise : ' + q.get('goods'));
if (parts.length && form.elements.message && !form.elements.message.value) form.elements.message.value = parts.join('\n') + '\n\n';
form.addEventListener('submit', function (e) {
e.preventDefault();
var msg = $('.form__msg', form), btn = $('button[type="submit"]', form);
if (form.elements.botcheck && form.elements.botcheck.checked) return;
if (!form.checkValidity()) { form.reportValidity(); return; }
var data = new FormData(form), obj = {};
data.forEach(function (v, k) { obj[k] = v; });
var waText = function () {
return 'Bonjour NICIS Global Transit, je souhaite une cotation.%0A' +
['name', 'company', 'phone', 'email', 'type', 'mode', 'from', 'to', 'goods', 'message'].filter(function (k) { return obj[k]; })
.map(function (k) { return encodeURIComponent(k + ' : ' + obj[k]); }).join('%0A');
};
if (!CFG.formKey) { // Aucun service de formulaire configuré : bascule vers WhatsApp
w.open('https://wa.me/' + CFG.wa + '?text=' + waText(), '_blank', 'noopener');
msg.className = 'form__msg ok'; msg.textContent = 'Votre demande s\'ouvre dans WhatsApp. Envoyez le message pour nous la transmettre.';
return;
}
btn.disabled = true; btn.style.opacity = .7;
obj.access_key = CFG.formKey; obj.subject = 'Demande de cotation — ' + (obj.company || obj.name); obj.from_name = 'Site NICIS Global Transit';
fetch('https://api.web3forms.com/submit', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(obj) })
.then(function (r) { return r.json(); })
.then(function (r) {
if (!r.success) throw 0;
msg.className = 'form__msg ok'; msg.textContent = 'Merci ! Votre demande a bien été envoyée. Un conseiller vous répond sous 24 h ouvrées.';
form.reset(); if (w.gtag) w.gtag('event', 'generate_lead', { method: 'form' });
})
.catch(function () { msg.className = 'form__msg err'; msg.innerHTML = 'L\'envoi a échoué. Écrivez-nous directement sur <a href="https://wa.me/' + CFG.wa + '?text=' + waText() + '">WhatsApp</a> ou à ' + CFG.email + '.'; })
.finally(function () { btn.disabled = false; btn.style.opacity = 1; });
});
}
$$('.chk').forEach(function (box) {
var chk = $('.doc-checker', box); if (!chk) return;
var run = function () {
var fob = parseFloat(String(chk.elements.fob.value).replace(/[^\d.]/g, '')) || 0;
var cur = chk.elements.cur.value, mode = chk.elements.mode.value, reg = chk.elements.reg.value;
var fcfa = cur === 'EUR' ? fob * 655.957 : cur === 'USD' ? fob * (CFG.usd || 600) : fob;
var set = function (id, on, label) {
var el = $('[data-doc="' + id + '"]', box); if (!el) return;
el.dataset.on = on; $('em', el).textContent = label;
};
set('doc-bsc', mode === 'mer' ? 1 : 0, mode === 'mer' ? 'Requis' : 'Non requis');
set('doc-fdi', fcfa > 500000 ? 1 : 0, fcfa > 500000 ? 'Requis' : 'Non requis');
set('doc-rfcv', fcfa >= 1000000 ? 1 : 0, fcfa >= 1000000 ? 'Requis' : 'Non requis');
set('doc-coc', 2, 'Selon code SH');
set('doc-trie', reg === 'transit' ? 1 : 0, reg === 'transit' ? 'Requis' : 'Non requis');
var out = $('.fob-fcfa', box); if (out) out.textContent = Math.round(fcfa).toLocaleString('fr-FR') + ' FCFA';
};
chk.addEventListener('input', run); chk.addEventListener('change', run); run();
});
$$('[data-map]').forEach(function (b) {
b.addEventListener('click', function () {
var f = d.createElement('iframe'); f.src = b.dataset.map; f.title = 'Localisation de NICIS Global Transit'; f.loading = 'lazy';
f.referrerPolicy = 'no-referrer-when-downgrade'; b.replaceWith(f);
});
});
var rv = $$('.rv');
if ('IntersectionObserver' in w && rv.length) {
var io = new IntersectionObserver(function (es) {
es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
}, { rootMargin: '0px 0px -8% 0px' });
rv.forEach(function (el) { io.observe(el); });
} else rv.forEach(function (el) { el.classList.add('in'); });
d.addEventListener('click', function (e) {
var a = e.target.closest && e.target.closest('a[href^="tel:"],a[href^="mailto:"],a[href*="wa.me"]');
if (a && w.gtag) w.gtag('event', 'contact_click', { link_url: a.href });
});
})();