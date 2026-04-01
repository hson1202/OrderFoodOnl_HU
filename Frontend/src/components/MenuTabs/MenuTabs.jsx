import React from 'react'
import './MenuTabs.css'
import { useTranslation } from 'react-i18next'

const MenuTabs = ({ activeTab, onTabChange }) => {
  const { t, i18n } = useTranslation()
  const currentLang = i18n.language

  const tabs = [
    { 
      id: 'daily', 
      name: {
        hu: 'NAPI MENÜ',
        en: 'DAILY MENU',
        vi: 'MENU HÀNG NGÀY'
      },
      icon: '📅'
    },
    { 
      id: 'main', 
      name: {
        hu: 'FŐ MENÜ',
        en: 'MAIN MENU',
        vi: 'MENU CHÍNH'
      },
      icon: '🍽️'
    },
    { 
      id: 'sushi', 
      name: {
        sk: 'SUSHI MENU',
        en: 'SUSHI MENU',
        vi: 'MENU SUSHI'
      },
      icon: '🍣'
    },
    { 
      id: 'drinks', 
      name: {
        hu: 'ITAL MENÜ',
        en: 'DRINKS MENU',
        vi: 'MENU ĐỒ UỐNG'
      },
      icon: '🥤'
    }
  ]

  const getTabName = (tab) => {
    return tab.name[currentLang] || tab.name.en
  }

  return (
    <div className="menu-tabs-container">
      <div className="menu-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`menu-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-name">{getTabName(tab)}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default MenuTabs

