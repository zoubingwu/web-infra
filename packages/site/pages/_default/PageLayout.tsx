import React from 'react'

type Children = React.ReactNode

function Layout({ children }: { children: Children }) {
  return (
    <div
      style={{
        display: 'flex',
        maxWidth: 900,
        margin: 'auto',
      }}>
      {children}
    </div>
  )
}

function Sidebar({ children }: { children: Children }) {
  return (
    <div
      style={{
        padding: 20,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        lineHeight: '1.8em',
      }}>
      {children}
    </div>
  )
}

function Content({ children }: { children: Children }) {
  return (
    <div
      style={{
        padding: 20,
        paddingBottom: 50,
        borderLeft: '2px solid #eee',
        minHeight: '100vh',
      }}>
      {children}
    </div>
  )
}

function Logo() {
  return (
    <div
      style={{
        marginTop: 20,
        marginBottom: 10,
      }}>
      <a href="/">logo </a>
    </div>
  )
}

function PageLayout({ children }: { children: Children }) {
  return (
    <React.StrictMode>
      <Layout>
        <Sidebar>
          <Logo />
          <a className="navitem" href="/">
            Home
          </a>
          <a className="navitem" href="/about">
            About
          </a>
        </Sidebar>
        <Content>{children}</Content>
      </Layout>
    </React.StrictMode>
  )
}

export default PageLayout
