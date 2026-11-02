/* HondaDespensa: presentación del acceso de administración y cuenta.
   Mantiene los manejadores existentes de Supabase y sus permisos. */
(() => {
  const init = () => {
    const admin = document.getElementById('adminToggle');
    const user = document.getElementById('headerUser');
    if (!admin || !user) return;
    admin.textContent = '⚙ Administrar';
    admin.classList.add('admin-link-simple');
    const moveUser = () => {
      const panel = document.getElementById('adminPanel') || document.querySelector('.admin-panel');
      if (!panel) return;
      let slot = document.getElementById('admin-account-slot');
      if (!slot) {
        slot = document.createElement('div');
        slot.id = 'admin-account-slot';
        slot.className = 'admin-account-slot';
        panel.appendChild(slot);
      }
      if (user.parentElement !== slot) slot.appendChild(user);
      user.classList.add('admin-user-control');
    };
    moveUser();
    new MutationObserver(moveUser).observe(document.body, {childList:true,subtree:true});
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
