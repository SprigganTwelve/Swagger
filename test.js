import Endpoint from "./models/Endpoints.js";
import LayoutBuilder from "./models/LayoutBuilder.js";
import Resource from "./models/Resource.js";
import Route from "./models/Route.js";
import ObjektraField from "./ValueObject/ObjekraField.js";
import Query from "./ValueObject/Query.js";
import RouteBadge from "./ValueObject/RouteBadge.js";
import ThemeStyle from "./ValueObject/ThemeStyle.js";
import ValueType from "./ValueObject/ValueType.js";



const layoutBuilder = new LayoutBuilder()
const container = layoutBuilder.init(ThemeStyle.WAR);
layoutBuilder.renderHeaderInputs()


export { LayoutBuilder, ThemeStyle, Resource, Route, Endpoint, Query, RouteBadge, ObjektraField, ValueType,  }

//POST

const postResource = new Resource("Post", [
    new Route({
        endpoint: new Endpoint({ 
            path: "/posts/{accountId}/{uuid}",
        }),
        method: "GET",
        description: "This one is used to get all the post from the Api",
        badges: [new RouteBadge("PUBLIC"), new RouteBadge("Collection")]
    }),
    new Route({
        endpoint: new Endpoint({
            path: "/posts/{accountId}",
            queries: [new Query({key: "uuid", mandatory: true})],
        }),
        method: "GET",
        description: "This one is used to get one specific post from the Api"
    }),
    new Route({
        endpoint: new Endpoint({
            path: "/posts",
            inputObjektraEntries: [
                new ObjektraField({ key: 'title', type: ValueType.String }),
                new ObjektraField({ key: 'content', type: ValueType.String }),
            ],
        }),
        method: "POST"
    }),
    new Route({
        endpoint: new Endpoint({
            path: "/posts",
            inputObjektraEntries: [
                10,
                [120, false],
                [                
                    // new ObjektraField({ key: "uuid", type: ValueType.Object, ext: [new ObjektraField({ key: "accountId", type: ValueType.String }),] }),
                    [ new ObjektraField({ key: "uuid", type: ValueType.String, }), { editableValue: true } ],
                    [ new ObjektraField({ key: "element", type: ValueType.String, }), { editableKey: true } ],
                    [ new ObjektraField({ key: "freed", type: ValueType.String, }), { editable: true } ],

                    [
                            [ new ObjektraField({ key: "hasItem", type: ValueType.String, }), { editableValue: true } ],
                            [ new ObjektraField({ key: "RespondTo", type: ValueType.String, }), { editableKey: true } ],
                            [ new ObjektraField({ key: "MakeOut", type: ValueType.String, }), { editable: true } ],
                    ],

                    [
                        new ObjektraField({ key: "accountId", type: ValueType.String }),
                        new ObjektraField({ key: "message", type: ValueType.String }),
                        new ObjektraField({ key: "celerity", type: ValueType.String })
                    ]
                ]
            ]
        }),
        method: "PATCH"
    }),
    new Route({
        endpoint: new Endpoint({
            path: "/posts/{accountId}",
            queries: [new Query({key: "uuid", mandatory: true})]
        }),
        method: "DELETE"
    }),
]);



//Account

const accountRessource = new Resource("Account", [
    new Route({
        endpoint: new Endpoint({ 
            path: "/account/{accountId}",
        }),
        method: "GET"
    }),
    new Route({
        endpoint: new Endpoint({ path: "/account" }),
        method: "DELETE"
    }),

]);





postResource.render(container);
accountRessource.render(container);

