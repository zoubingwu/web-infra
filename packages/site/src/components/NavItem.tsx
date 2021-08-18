import React, { useCallback } from 'react'
import clsx from 'clsx'

import { actions, useAppDispatch, useAppSelector } from '../model'

interface NavItemData {
  title: string
  route: string
  level: number
  items?: NavItemData[]
}

const NavItem: React.FC<
  NavItemData & { className?: string; style?: React.CSSProperties }
> = ({ title, route, items, level, className, style }) => {
  const dispatch = useAppDispatch()
  const currentRoute = useAppSelector(state => state.routes.route)
  const changeRoute = useCallback(() => {
    dispatch(actions.setRoute(route))
  }, [title])

  const isExpand = currentRoute.startsWith(route)

  return (
    <li>
      <div>
        <a
          href={'#' + route}
          onClick={changeRoute}
          style={style}
          className={clsx(
            'flex flex-col py-5px hover:font-bold',
            level === 0 && 'font-bold',
            className
          )}>
          {title}
        </a>

        {isExpand && items && (
          <ul>
            {items.map(i => (
              <NavItem
                title={i.title}
                route={[route, i.route].join('.')}
                level={i.level}
                key={i.route}
                style={{ marginLeft: 20 * (i.level - 1) + 'px' }}
              />
            ))}
          </ul>
        )}
      </div>
    </li>
  )
}

export default NavItem
