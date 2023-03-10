import {GraphQLClient, gql} from 'graphql-request'
import NavBar from '../../components/NavBar';
import Footer from '../../components/Footer';
import Head from 'next/head'

const graphcms = new GraphQLClient("https://api-ap-south-1.hygraph.com/v2/clckiz8mj1fr101ukd1cqfzkm/master");

const QUERY = gql`
    query Post($slug: String!){
        post(where: {slug: $slug}){
            id, title, slug, publishedOn, 
            content{ html }
        }
    }
`;

const SLUGLIST = gql`
{
    posts{
        slug
    }
}
`;

export async function getStaticPaths(){
    const {posts} = await graphcms.request(SLUGLIST);
    return {
        paths: posts.map((post => ({params: {slug: post.slug}}))),
        fallback: false,
    }
    paths: ['']
}

export async function getStaticProps({params}){
    const slug = params.slug
  const data = await graphcms.request(QUERY, {slug});
  const post = data.post
  return {
    props: {
      post,
    },
    revalidate: 10,
  };
}

const toDate = (dateStr) => {
    const [year, month, day] = dateStr.split("-")
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(year, month - 1, day).toLocaleDateString(undefined, options)
  }

export default function BlogPost({post}){
    return(<>
    <Head>
        <title>{post.title} | Ahmed Saad</title>
        <meta name="description" content={post.desciption} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicon.ico" />
      </Head>
        <div className='px-5 mx-auto overflow-x-hidden'>
            <NavBar/>
            <div className='MAIN CONTENT flex flex-col items-start mx-auto justify-center md:max-w-3xl w-full mb-16'>
                <h1 className='text-3xl max-w-sm font-bold mt-5 md:mt-0 md:text-5xl'>{post.title}</h1>
                <p className='text-gray-500 py-3'>{toDate(post.publishedOn)}</p>
                <div className='prose space-y-8 text-gray-500 leading-relaxed text-lg w-full max-w-sm md:max-w-3xl' 
                    dangerouslySetInnerHTML={{__html: post.content.html}}
                ></div>
                
                <div className='mt-12 w-full'><Footer/></div>
            </div>
            
        </div>
        </>
    )
}