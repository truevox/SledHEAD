// js/upgrades.js
import { upgradeCategories } from './upgradeData.js';
import { 
  playerUpgrades, 
  mountainUpgrades, 
  upgradeMaxLevel, 
  purchaseUpgrade, 
  getUpgradeCost,
  getUpgradeDisplayText 
} from './upgradeLogic.js';
// Using global capitalizeFirstLetter instead of importing it

function createUpgradeElement(upgrade, isPlayerUpgrade = true) {
  const upgradeType = isPlayerUpgrade ? playerUpgrades : mountainUpgrades;
  const currentLevel = upgradeType[upgrade.key];
  const maxLevel = upgradeMaxLevel[upgrade.key];
  const cost = getUpgradeCost(upgrade.key, currentLevel);

  const entry = document.createElement('div');
  entry.className = 'upgrade-entry';

  const button = document.createElement('button');
  const btnId = `upgrade${capitalizeFirstLetter(upgrade.key)}`;
  button.id = btnId;
  button.innerText = getUpgradeDisplayText(upgrade.key, currentLevel, maxLevel);

  // Disable if maxed or locked
  if (maxLevel === 0 || currentLevel >= maxLevel) {
    button.disabled = true;
  }

  button.addEventListener('click', () => {
    purchaseUpgrade(upgradeType, upgrade.key);
  });

  const desc = document.createElement('p');
  desc.className = 'upgrade-desc';
  desc.textContent = upgrade.desc;

  entry.appendChild(button);
  entry.appendChild(desc);
  return entry;
}

function renderUpgradeMenu() {
  const container = document.getElementById('dynamic-upgrade-columns');
  if (!container) return;

  upgradeCategories.forEach(category => {
    const column = document.createElement('div');
    column.className = 'upgrade-column';

    const header = document.createElement('h2');
    header.textContent = category.name;
    column.appendChild(header);

    const isPlayerUpgrade = category.type === "player";
    category.upgrades.forEach(upgrade => {
      const element = createUpgradeElement(upgrade, isPlayerUpgrade);
      column.appendChild(element);
    });

    container.appendChild(column);
  });
}

renderUpgradeMenu();
