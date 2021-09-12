import styled from 'styled-components'
import { Header } from './Header'
import { navigate, Redirect } from '@reach/router'

const Layout = styled.div`
  margin-top: 100px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 80vh;
  width: 100vw;
`

const SiteLayout = styled.div`
  background-color: #eeeeee;
  text-align: center;
  padding: 40px;
  margin: 24px;
  width: 400px;
  cursor: pointer;
  font-size: 150%;

  &:hover {
    background-color: #cccccc;
  }
`

const NotFoundLayout = styled.div`
  font-size: 150%;
  color: red;
  font-weight: bold;
`

const Site = ({name, site}) => {
  const onClick = () => navigate(`/${site}`)
  return (
    <SiteLayout onClick={onClick}>
      { name }
    </SiteLayout>
  )
}

const NotFound = ({site}) => (
  <NotFoundLayout>
    Site <i>{site}</i> not found.
  </NotFoundLayout>
)

export const Selection = ({profile, notFound, refreshLogin}) => {
  const sites = profile.sites || [profile.site]
  const siteNames = profile.siteNames
  if (!notFound && sites.length === 1) {
    // only redirect if we're not showing an error
    return <Redirect to={`/${sites[0]}`} />
  }
  return (
    <>
      <Header profile={profile} site={null} refreshLogin={refreshLogin} />
      <Layout>
        { notFound && <NotFound site={notFound} /> }
        { sites.map(site => <Site name={siteNames[site] || site} site={site} />) }
      </Layout>
    </>
  )
}
