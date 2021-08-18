import React from 'react'

import DOCS_DATA from '../docs.generated.json'

import NavItem from './NavItem'

const NavMenu = () => {
  return (
    <ul className="py-15px">
      {DOCS_DATA.nav.map(d => (
        <NavItem key={d.title} {...d} />
      ))}
    </ul>
  )
}

export default NavMenu
