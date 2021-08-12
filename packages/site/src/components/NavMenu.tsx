import React from 'react'

import DOCS_DATA from '../docs.generated.json'

import NavItem from './NavItem'

const NavMenu = () => {
  return (
    <ul>
      {DOCS_DATA.nav.map(d => (
        <NavItem key={d.title} {...d} />
      ))}
    </ul>
  )
}

export default NavMenu
