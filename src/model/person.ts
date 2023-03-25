
import { Location } from './location'

interface Person {

    _id: string;
    name: {
        first: string;
        last: string;
    };
    picture: string;
    email: string;
    location: Location;
}


export {
    Person
}