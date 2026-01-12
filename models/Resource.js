
 //Represents a Resource (group of routes)

class Resource 
{
    constructor(name, routes = []) {
        this.name = name;
        this.routes = routes; //An array of Route
    }


    render(container) {
        const resourceEl = document.createElement("div");
        resourceEl.className = "resource";

        const title = document.createElement("h2");
        title.className = "resource-title";
        title.textContent = this.name;

        resourceEl.appendChild(title);

        this.routes.forEach(route => {
            resourceEl.appendChild(this.renderRoute(route));
        });

        container.appendChild(resourceEl);
    }

     //* Render a single route block

    renderRoute(route) {
        route.paint()
        return route.rootContainer;
    }
}

export default Resource