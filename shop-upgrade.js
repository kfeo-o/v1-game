'use strict';

{
  const screen = $('shop-screen');
  const dialog = screen.querySelector('.shop-dialog');
  const heading = dialog.querySelector('h2');
  const grid = $('shop-grid');
  const balance = $('shop-coins');
  const forecast = $('shop-tip');
  const nextWave = $('next-wave-btn');
  const number = new Intl.NumberFormat();
  const supplies = new Set(['heal', 'shield', 'ammo', 'pulse', 'grenade', 'molotov']);
  const upgradeCaps = { damage: 6, rate: 5, speed: 5, maxhp: 5 };
  const categories = [
    { label: 'Supplies', contains: item => supplies.has(item.id) },
    { label: 'Upgrades', contains: item => Object.hasOwn(upgradeCaps, item.id) },
    { label: 'Blasters', contains: item => !item.sidearm },
    { label: 'Sidearms', contains: item => item.sidearm },
    { label: 'Mods' }
  ];
  const modsTab = categories.length - 1;
  const statusLabels = {
    'ALREADY FULL': 'Full',
    'AMMO STOCKED': 'Stocked',
    'MAXED OUT': 'Maxed',
    OWNED: 'Owned'
  };
  const statDetails = {
    ion: 'Fast automatic fire with a deep magazine.',
    comet: 'Heavy, slow-moving energy rounds.',
    echo: 'Three energy bolts per trigger pull.',
    zenith: 'High-damage precision fire with a magnified optic.'
  };
  let activeTab = 0;
  let rows = [];
  let modWeapon = 0;

  dialog.classList.add('refit-shop');
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-labelledby', 'refit-heading');
  heading.id = 'refit-heading';
  heading.replaceChildren('Wave ', $('shop-wave'), ' cleared');
  dialog.querySelector('.shop-head .cap').textContent = 'Supply drop';
  dialog.querySelector('.shop-head .muted').remove();
  dialog.querySelector('.shop-balance .cap').textContent = 'Credits';
  nextWave.textContent = 'Next wave →';

  const readiness = document.createElement('dl');
  readiness.className = 'refit-readiness';
  const readinessStats = ['Integrity', 'Shield', 'EMP pulses'].map(label => {
    const group = document.createElement('div');
    const term = document.createElement('dt');
    const value = document.createElement('dd');
    term.textContent = label;
    group.append(term, value);
    readiness.append(group);
    return value;
  });
  const tabList = document.createElement('div');
  tabList.className = 'refit-tabs';
  tabList.setAttribute('role', 'tablist');
  tabList.setAttribute('aria-label', 'Shop categories');
  const tabs = categories.map(({label}, index) => {
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.id = 'refit-tab-' + index;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', grid.id);
    tab.textContent = label;
    tab.addEventListener('click', () => selectTab(index));
    tabList.append(tab);
    return tab;
  });
  grid.before(readiness, tabList);
  grid.setAttribute('role', 'tabpanel');
  grid.tabIndex = 0;

  const modPanel = document.createElement('section');
  modPanel.className = 'refit-mods';
  modPanel.hidden = true;
  const modHeader = document.createElement('div');
  modHeader.className = 'refit-mods-header';
  const modLabel = document.createElement('label');
  modLabel.textContent = 'Weapon to modify';
  const modSelect = document.createElement('select');
  modLabel.append(modSelect);
  const modInfo = document.createElement('p');
  const modChoices = document.createElement('div');
  modHeader.append(modLabel, modInfo);
  modPanel.append(modHeader, modChoices);
  modSelect.addEventListener('change', () => {
    modWeapon = Number(modSelect.value);
    renderModChoices();
  });

  const announcement = document.createElement('span');
  announcement.className = 'refit-announcement';
  announcement.setAttribute('role', 'status');
  dialog.append(announcement);

  function selectTab(index, moveFocus = false, resetScroll = true) {
    activeTab = index;
    tabs.forEach((tab, tabIndex) => {
      const selected = tabIndex === index;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    grid.setAttribute('aria-labelledby', tabs[index].id);
    for (const {row, category} of rows) row.hidden = category !== index;
    modPanel.hidden = index !== modsTab;
    if (resetScroll) grid.scrollTop = 0;
    if (moveFocus) tabs[index].focus({preventScroll: true});
  }

  function itemLabel(definition) {
    return definition.name.replace(/^[^A-Z0-9]+/i, '').replace(/[\w-]+/g, word => {
      if (word === 'EMP' || word === 'SMG') return word;
      return word[0] + word.slice(1).toLowerCase();
    });
  }

  function installMod(mod) {
    const slot = weapons[modWeapon];
    const weapon = WEAPONS[modWeapon];
    if (state !== 'SHOP' || !slot?.unlocked || slot.mod || coins < mod.cost ||
        (mod.sidearm && !weapon.sidearm)) return;
    slot.profile = mod.tune(weapon);
    slot.mod = mod;
    coins -= mod.cost;
    if (activeWeapon === modWeapon) reloadTimer = 0;
    snd('buy');
    renderShop();
    refreshHUD();
    modSelect.focus({preventScroll: true});
    announcement.textContent = `${mod.name} installed on ${itemLabel(weapon)}. ${number.format(coins)} credits remaining.`;
  }

  function renderModChoices() {
    const weapon = WEAPONS[modWeapon];
    const installed = weapons[modWeapon]?.mod;
    modInfo.textContent = installed ? `${installed.name} is installed for this mission.` :
      'Choose one mod per weapon for this mission.';
    modChoices.replaceChildren();
    for (const mod of NEON_WEAPON_MODS) {
      if (mod.sidearm && !weapon.sidearm) continue;
      const row = document.createElement('div');
      row.className = 'shop-item';
      const text = document.createElement('div');
      text.className = 'refit-item-text';
      const name = document.createElement('h3');
      name.textContent = mod.name;
      const detail = document.createElement('p');
      detail.textContent = mod.detail;
      text.append(name, detail);
      const action = document.createElement('div');
      action.className = 'refit-item-action';
      const price = document.createElement('span');
      price.className = 'refit-price';
      price.textContent = `${number.format(mod.cost)} ◇`;
      price.setAttribute('aria-label', `${number.format(mod.cost)} credits`);
      price.hidden = !!installed;
      const button = document.createElement('button');
      button.type = 'button';
      button.disabled = !!installed || coins < mod.cost;
      button.textContent = installed ? (installed === mod ? 'Installed' : 'Unavailable') :
        coins < mod.cost ? `Need ${number.format(mod.cost - coins)}` : 'Install';
      button.setAttribute('aria-label', `${mod.name}. ${button.textContent}.`);
      button.addEventListener('click', () => installMod(mod));
      row.classList.toggle('refit-owned', installed === mod);
      action.append(price, button);
      row.append(text, action);
      modChoices.append(row);
    }
  }

  function renderMods() {
    if (!weapons[modWeapon]?.unlocked) modWeapon = activeWeapon;
    const options = [];
    WEAPONS.forEach((weapon, i) => {
      if (!weapons[i]?.unlocked) return;
      const option = document.createElement('option');
      option.value = i;
      option.textContent = itemLabel(weapon);
      options.push(option);
    });
    modSelect.replaceChildren(...options);
    modSelect.value = modWeapon;
    renderModChoices();
    grid.append(modPanel);
  }

  function formatRow(row) {
    const button = row.querySelector('[data-buy]');
    const item = button.dataset.buy;
    const definition = shopDefs.find(entry => entry.id === item);
    const label = itemLabel(definition);
    const {cost, reason} = buyState(item);
    const ownedSidearm = definition.sidearm && reason === 'OWNED';
    const text = document.createElement('div');
    text.className = 'refit-item-text';
    const title = document.createElement('h3');
    title.textContent = label;
    const description = document.createElement('p');
    description.textContent = statDetails[item] || definition.desc;
    text.append(title, description);
    if (item in upgradeCaps) {
      const level = document.createElement('span');
      level.className = 'refit-item-level';
      level.textContent = `Level ${upg[item]} / ${upgradeCaps[item]}`;
      title.append(level);
    }
    const action = document.createElement('div');
    action.className = 'refit-item-action';
    const price = document.createElement('span');
    price.className = 'refit-price';
    price.textContent = number.format(cost) + ' ◇';
    price.setAttribute('aria-label', number.format(cost) + ' credits');
    const status = reason === 'NOT ENOUGH' ? 'Need ' + number.format(cost - coins) :
      statusLabels[reason] || reason;
    button.type = 'button';
    button.textContent = status || 'Buy';
    button.setAttribute('aria-label', reason ? `${label}. ${status}${reason === 'NOT ENOUGH' ? ' more credits' : ''}.` :
      `Buy ${label} for ${number.format(cost)} credits`);
    if (ownedSidearm) {
      const equipped = getWeapon().id === item;
      price.textContent = 'Owned';
      price.removeAttribute('aria-label');
      button.disabled = equipped;
      button.textContent = equipped ? 'Equipped' : 'Equip';
      button.setAttribute('aria-label', equipped ? `${label} equipped` : `Equip ${label}`);
    }
    action.append(price, button);
    row.replaceChildren(text, action);
    row.classList.toggle('refit-owned', reason === 'OWNED');
    const category = categories.findIndex(section => section.contains?.(definition));
    return { row, category };
  }

  tabList.addEventListener('keydown', event => {
    const index = tabs.indexOf(event.target);
    if (index < 0) return;
    const positions = {
      ArrowLeft: (index + tabs.length - 1) % tabs.length,
      ArrowRight: (index + 1) % tabs.length,
      Home: 0,
      End: tabs.length - 1
    };
    if (!Object.hasOwn(positions, event.key)) return;
    event.preventDefault();
    selectTab(positions[event.key], true);
  });

  document.addEventListener('keydown', event => {
    if (event.key !== 'Tab' || state !== 'SHOP' || screen.classList.contains('hidden')) return;
    const controls = [tabs[activeTab], grid,
      ...[...grid.querySelectorAll('select, .shop-item button:not(:disabled)')].filter(control => !control.closest('[hidden]')),
      nextWave];
    const index = controls.indexOf(document.activeElement);
    if (index < 0 || (event.shiftKey ? index === 0 : index === controls.length - 1)) {
      event.preventDefault();
      controls[event.shiftKey ? controls.length - 1 : 0].focus();
    }
  });

  const baseRenderShop = renderShop;
  renderShop = function () {
    const focusedItem = document.activeElement?.dataset.buy;
    const top = grid.scrollTop;
    baseRenderShop();
    balance.textContent = number.format(coins);
    if (forecast.textContent.startsWith('WARNING:')) {
      forecast.textContent = `Wave ${wave + 1} · Boss encounter`;
    } else if (forecast.textContent.startsWith('Wave ')) {
      forecast.textContent = `Next up · Wave ${wave + 1}`;
    }
    readinessStats[0].textContent = `${Math.ceil(player.hp)} / ${player.maxHp}`;
    readinessStats[1].textContent = `${Math.ceil(player.shield)} / 100`;
    readinessStats[2].textContent = number.format(player.pulses);
    rows = [...grid.querySelectorAll('.shop-item')].map(formatRow);
    renderMods();
    selectTab(activeTab, false, false);
    grid.scrollTop = top;
    if (focusedItem) {
      const replacement = grid.querySelector(`[data-buy="${focusedItem}"]:not(:disabled)`);
      (replacement || tabs[activeTab]).focus({preventScroll: true});
    }
  };

  const baseFinishWave = finishWave;
  finishWave = function () {
    const opening = state === 'PLAYING' && wave < MAX_WAVES;
    if (opening) {
      activeTab = 0;
      modWeapon = activeWeapon;
      announcement.textContent = '';
    }
    baseFinishWave();
    if (opening && state === 'SHOP') selectTab(0, true);
  };

  const baseBuy = buy;
  buy = function (item) {
    if (state !== 'SHOP') return;
    const definition = shopDefs.find(entry => entry.id === item);
    const sidearm = definition?.sidearm ? WEAPONS.findIndex(weapon => weapon.id === item) : -1;
    if (weapons[sidearm]?.unlocked) {
      if (!equipWeapon(sidearm)) return;
      snd('reload');
      renderShop();
      refreshHUD();
      announcement.textContent = `${itemLabel(definition)} equipped.`;
      return;
    }
    const before = coins;
    baseBuy(item);
    if (coins < before) {
      announcement.textContent = `${itemLabel(definition)} purchased. ${number.format(coins)} credits remaining.`;
    }
  };

  selectTab(0);
}
