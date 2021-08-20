import React, { useCallback } from 'react'

import { actions, useAppDispatch } from '../model'

const Link: React.FC<{ href: string }> = ({ href, children }) => {
  const dispatch = useAppDispatch()
  const changeRoute = useCallback(() => {
    if (href.startsWith('#')) {
      dispatch(actions.setRoute(href.slice(1)))
    } else {
      dispatch(actions.setRoute(href))
    }
  }, [href])

  return (
    <a href={href} onClick={changeRoute}>
      {children}
    </a>
  )
}

export default Link
