import React from 'react'

import docsData from '../docs.generated.json'

import NavItem from './NavItem'

const NavMenu = () => {
  return (
    <ul className="py-15px">
      {docsData.nav.map(d => (
        <NavItem
          key={d.title}
          title={d.title}
          items={d.children}
          route={d.route}
          level={d.level}
        />
      ))}
    </ul>
  )
}

export default NavMenu
