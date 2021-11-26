import styled from 'styled-components'
import { Header } from './Header'
import { navigate, Redirect } from '@reach/router'

const Layout = styled.div`
  margin-top: 8rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100vw;

  @media screen and (max-width: 30rem) {
    margin-top: 5rem;
  }
`

const SiteLayout = styled.div`
  background-color: #eeeeee;
  text-align: center;
  padding: 2rem;
  margin: 1rem;
  max-width: 400px;
  width: calc(100% - 4rem);
  cursor: pointer;
  font-size: 1.5rem;
  box-sizing: border-box;

  &:hover {
    background-color: #cccccc;
  }

  @media screen and (max-width: 30rem) {
    padding: 1rem;
    margin: 0.5rem;
    font-size: 1rem;
  }
`

const NotFoundLayout = styled.div`
  font-size: 1.5rem;
  color: red;
  font-weight: bold;

  @media screen and (max-width: 30rem) {
    font-size: 1rem;
  }
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
  const sites = profile.sitesObj
  const siteKeys = Object.keys(sites)
  // const siteNames = profile.siteNames
  if (!notFound && siteKeys.length === 1) {
    // only redirect if we're not showing an error
    return <Redirect to={`/${siteKeys[0]}`} />
  }
  return (
    <>
      <Header profile={profile} site={null} refreshLogin={refreshLogin} />
      <Layout>
        { notFound && <NotFound site={notFound} /> }
        { siteKeys.map(site => <Site name={sites[site].name || site} site={site} />) }
      </Layout>
    </>
  )
}
