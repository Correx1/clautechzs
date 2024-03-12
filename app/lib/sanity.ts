import ImageUrlBuilder  from "@sanity/image-url"
import { createClient } from "next-sanity"


export const client = createClient({
    projectId: 'votyhd1p',
    dataset:'production',
    apiVersion: '2024-03-01',
    useCdn:true,
    
})

const builder = ImageUrlBuilder(client);

export function urlFor(source: any) {
    return builder.image(source)
}


