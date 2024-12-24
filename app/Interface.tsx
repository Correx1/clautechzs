export interface simplifiedProduct{
    _id: string;
    imageUrl: string;
    price: number;
    slug: string;
    categoryName: string;
    name: string;
    description: string;
    fakePrice: number;
    deviceType:string;
    images: any;
    shoeSizes: any;
    clothSizes: any;
    color: any;
}
export interface ProductDetails{
    image: any;
    price: number;
    slug: string;
    category: string;
    name: string;
    desc: string;
}

export interface FormData {
    description: string;
    image: any;
    personName: string;
    email: string;
    phone: string;
    size: string;
    clothSize: string;
  
}

export interface RequestData {

    Description: string;
    Image: any;
    Name: string;
    Email: string;
    Phone: string;
    Shoe_Size: string;
    Cloth_Size: string;
    createdAt: any;

}

export interface DeliveryData {
    Name: string;
    Email: string;
    Phone: string;
    location: string;
    createdAt: any;
    items: any;
    totalPrice: any;
    Shoe_Size: string;
    Cloth_Size: string;
    orderNumber: string;
}
export interface SecFormData {
    personName: string;
    email: string;
    phone: string;
    location: string;
    size: string;
    clothSize: string;
}

export interface FormErrors {
    [key: string]: string;
}