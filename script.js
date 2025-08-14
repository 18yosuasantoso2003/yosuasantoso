(function(){
  function toRp(num){
    return 'Rp ' + Number(num).toLocaleString('id-ID');
  }

  document.querySelectorAll('#year,#year2,#year3').forEach(el=>{
    el.textContent = new Date().getFullYear();
  });

  // Produk page
  document.querySelectorAll('.btn-buy').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const prod = {
        id: btn.dataset.id,
        name: btn.dataset.name,
        price: Number(btn.dataset.price),
        img: btn.dataset.img
      };
      sessionStorage.setItem('selectedProduct', JSON.stringify(prod));
      sessionStorage.setItem('miniQty', '1');
      window.location.href = 'transaksi.html';
    });
  });

  const miniCart = document.getElementById('mini-cart');
  if(miniCart){
    const sel = sessionStorage.getItem('selectedProduct');
    if(sel){
      const p = JSON.parse(sel);
      miniCart.innerHTML = `<div><strong>${p.name}</strong><p>${toRp(p.price)}</p></div>
      <a href="transaksi.html" class="btn-link">Lanjutkan ke Transaksi</a>`;
    }
  }

  // Transaksi page
  if(document.getElementById('transaksi-form')){
    const selected = sessionStorage.getItem('selectedProduct');
    const productBox = document.getElementById('selected-product');
    if(selected){
      const p = JSON.parse(selected);
      productBox.innerHTML = `<img src="${p.img}" style="max-width:180px;display:block;margin-bottom:8px"><strong>${p.name}</strong><p>${toRp(p.price)}</p>`;
    } else {
      productBox.innerHTML = '<p>Tidak ada produk terpilih.</p>';
    }

    const qty = document.getElementById('qty');
    const subtotalEl = document.getElementById('subtotal');
    const totalEl = document.getElementById('total');
    const SHIPPING = 30000;

    function recalc(){
      const q = Number(qty.value) || 1;
      const price = selected ? JSON.parse(selected).price : 0;
      subtotalEl.textContent = toRp(q * price);
      totalEl.textContent = toRp(q * price + SHIPPING);
    }
    qty.addEventListener('input', recalc);
    recalc();

    document.getElementById('btn-back').addEventListener('click',()=>{
      window.location.href='index.html';
    });

    document.getElementById('transaksi-form').addEventListener('submit',e=>{
      e.preventDefault();
      const nama = document.getElementById('nama').value.trim();
      const email = document.getElementById('email').value.trim();
      const tel = document.getElementById('tel').value.trim();
      const alamat = document.getElementById('alamat').value.trim();
      const metode = document.getElementById('metode').value;
      const q = Number(qty.value) || 1;

      if(!nama || !email || !tel || !alamat) return alert('Lengkapi data!');

      const prod = selected ? JSON.parse(selected) : null;
      const subtotal = prod.price * q;
      const total = subtotal + SHIPPING;

      const order = {
        id: 'ORD' + Date.now(),
        produk: prod,
        qty: q,
        subtotal,
        shipping: SHIPPING,
        total,
        buyer: {nama,email,tel,alamat},
        metode,
        createdAt: new Date().toISOString()
      };

      sessionStorage.setItem('lastOrder', JSON.stringify(order));
      sessionStorage.removeItem('selectedProduct');
      window.location.href = 'invoice.html';
    });
  }

  // Invoice page
  if(document.getElementById('invoice-wrap')){
    const ordRaw = sessionStorage.getItem('lastOrder');
    if(!ordRaw){
      document.getElementById('invoice-wrap').innerHTML = '<p>Tidak ada invoice.</p>';
    } else {
      const ord = JSON.parse(ordRaw);
      const d = new Date(ord.createdAt);
      document.getElementById('invoice-wrap').innerHTML = `
        <h2>INVOICE</h2>
        <p><strong>No Pesanan:</strong> ${ord.id}</p>
        <p><strong>Tanggal:</strong> ${d.toLocaleString()}</p>
        <hr>
        <h3>Produk</h3>
        <div style="display:flex;gap:12px">
          <img src="${ord.produk.img}" style="width:180px">
          <div><strong>${ord.produk.name}</strong>
          <p>Harga: ${toRp(ord.produk.price)}</p>
          <p>Jumlah: ${ord.qty}</p></div>
        </div>
        <hr>
        <p>Subtotal: ${toRp(ord.subtotal)}</p>
        <p>Ongkir: ${toRp(ord.shipping)}</p>
        <p>Total: ${toRp(ord.total)}</p>
        <p>Metode: ${ord.metode}</p>
        <hr>
        <h3>Pembeli</h3>
        <p>Nama: ${ord.buyer.nama}</p>
        <p>Email: ${ord.buyer.email}</p>
        <p>Tel: ${ord.buyer.tel}</p>
        <p>Alamat: ${ord.buyer.alamat}</p>
      `;

      document.getElementById('btn-print').addEventListener('click',()=>window.print());
      document.getElementById('btn-download').addEventListener('click',()=>{
        const blob = new Blob([JSON.stringify(ord,null,2)],{type:'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = ord.id+'.json';
        document.body.appendChild(a); a.click(); a.remove();
        URL.revokeObjectURL(url);
      });
    }
  }
})();
