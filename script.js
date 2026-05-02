/* ============================================================
   Hotel Website – script.js
   TT284 Web Technologies | AOU Spring 2025/26
   Ahmed Bahaa
   ============================================================ */


function sendMessage(e) {
    e.preventDefault();
    var msg = document.getElementById('contact-success');
    if (msg) {
        msg.style.display = 'block';
        e.target.reset();
        setTimeout(function () { msg.style.display = 'none'; }, 5000);
    }
}


function filterHotels(cat, btn) {

    document.querySelectorAll('.filter-btn').forEach(function (b) {
        b.classList.remove('active');
    });
    btn.classList.add('active');

   document.querySelectorAll('.hotel-cat-card').forEach(function (card) {
        if (cat === 'all' || card.dataset.cat === cat) {
            card.classList.remove('hidden');
        } else {
            card.classList.add('hidden');
        }
    });
}

function changeQty(btn, delta) {
    var ctrl = btn.parentElement;
    var qtyEl = ctrl.querySelector('.qty');
    var current = parseInt(qtyEl.textContent) || 0;
    var newVal  = Math.max(0, current + delta);
    qtyEl.textContent = newVal;

    var row = ctrl.closest('.room-row');
    if (newVal > 0) { row.classList.add('selected'); }
    else            { row.classList.remove('selected'); }

    updateSummary();
}


function updateSummary() {
    var linesDiv = document.getElementById('summary-lines');
    if (!linesDiv) return;

    var rows = document.querySelectorAll('.room-row');
    var selected = [];
    var nightlyTotal = 0;

    rows.forEach(function (row) {
        var qty   = parseInt(row.querySelector('.qty').textContent) || 0;
        var price = parseInt(row.dataset.price) || 0;
        var name  = row.querySelector('strong').textContent;
        if (qty > 0) {
            selected.push({ name: name, qty: qty, price: price });
            nightlyTotal += qty * price;
        }
    });

    if (selected.length === 0) {
        linesDiv.innerHTML = '<p class="empty-summary">No rooms selected yet.</p>';
    } else {
        linesDiv.innerHTML = selected.map(function (s) {
            return '<div class="summary-line"><span>' + s.name + ' &times; ' + s.qty + '</span>' +
                   '<span>$' + (s.qty * s.price) + '/night</span></div>';
        }).join('');
    }

    updateTotal(nightlyTotal);
}


function updateTotal(nightlyTotal) {
    var checkinEl  = document.getElementById('res-checkin');
    var checkoutEl = document.getElementById('res-checkout');
    var totalEl    = document.getElementById('grand-total');
    var nightsEl   = document.getElementById('nights-info');
    if (!totalEl) return;

    if (typeof nightlyTotal === 'undefined') {
        nightlyTotal = 0;
        document.querySelectorAll('.room-row').forEach(function (row) {
            var qty   = parseInt(row.querySelector('.qty').textContent) || 0;
            var price = parseInt(row.dataset.price) || 0;
            nightlyTotal += qty * price;
        });
    }

    var nights = 0;
    if (checkinEl && checkoutEl && checkinEl.value && checkoutEl.value) {
        var d1 = new Date(checkinEl.value);
        var d2 = new Date(checkoutEl.value);
        var diff = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
        if (diff > 0) nights = diff;
    }

    if (nightsEl) {
        if (nights > 0) {
            nightsEl.style.display = 'block';
            nightsEl.textContent   = nights + ' night' + (nights > 1 ? 's' : '') + ' selected';
        } else {
            nightsEl.style.display = 'none';
        }
    }

    var total = nightlyTotal * nights;
    totalEl.textContent = total > 0 ? '$' + total.toLocaleString() : '$0';
}


function confirmRes() {
    var name     = document.getElementById('g-name');
    var email    = document.getElementById('g-email');
    var phone    = document.getElementById('g-phone');
    var checkin  = document.getElementById('res-checkin');
    var checkout = document.getElementById('res-checkout');
    var msgEl    = document.getElementById('res-confirm-msg');
    var totalEl  = document.getElementById('grand-total');

    // Validation
    if (!name || !name.value.trim())   { alert('Please enter your full name.'); return; }
    if (!email || !email.value.trim()) { alert('Please enter your email address.'); return; }
    if (!phone || !phone.value.trim()) { alert('Please enter your phone number.'); return; }
    if (!checkin || !checkin.value)    { alert('Please select a check-in date.'); return; }
    if (!checkout || !checkout.value)  { alert('Please select a check-out date.'); return; }

    var d1 = new Date(checkin.value);
    var d2 = new Date(checkout.value);
    if (d2 <= d1) { alert('Check-out must be after check-in date.'); return; }

    var hasRoom = false;
    document.querySelectorAll('.room-row').forEach(function (row) {
        if (parseInt(row.querySelector('.qty').textContent) > 0) hasRoom = true;
    });
    if (!hasRoom) { alert('Please select at least one room.'); return; }

    // Show success message
    if (msgEl) {
        var total = totalEl ? totalEl.textContent : '$0';
        msgEl.style.display  = 'block';
        msgEl.style.background     = '#e8f5e9';
        msgEl.style.border         = '1.5px solid #a5d6a7';
        msgEl.style.borderRadius   = '12px';
        msgEl.style.padding        = '16px';
        msgEl.style.marginTop      = '14px';
        msgEl.style.color          = '#1b5e20';
        msgEl.style.lineHeight     = '1.7';
        msgEl.innerHTML =
            '<strong> Reservation Confirmed!</strong><br>' +
            'Thank you, <strong>' + name.value + '</strong>!<br>' +
            'Stay: <strong>' + checkin.value + '</strong> → <strong>' + checkout.value + '</strong><br>' +
            'Total: <strong>' + total + '</strong><br>' +
            'Confirmation sent to <strong>' + email.value + '</strong>.';
        msgEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

(function () {
    var today = new Date().toISOString().split('T')[0];

    // Reservation page dates
    var ri = document.getElementById('res-checkin');
    var ro = document.getElementById('res-checkout');
    if (ri) { ri.min = today; ri.value = today; }
    if (ro) {
        var tom = new Date(); tom.setDate(tom.getDate() + 1);
        var tomStr = tom.toISOString().split('T')[0];
        ro.min   = tomStr;
        ro.value = tomStr;
    }
    if (ri && ro) updateTotal();
    // Pre-fill URL
    var params   = new URLSearchParams(window.location.search);
    var roomName = params.get('room');
    var roomPriceParam = params.get('price');
    if (roomName && roomPriceParam) {
        document.querySelectorAll('.room-row').forEach(function (row) {
            if (row.querySelector('strong').textContent === roomName) {
                row.querySelector('.qty').textContent = '1';
                row.classList.add('selected');
            }
        });
        setTimeout(updateSummary, 100);
    }
})();
