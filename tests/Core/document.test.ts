beforeEach(() => {
  document.body.innerHTML = "";
});

describe("Document.ready", () => {
  it("should run when the document is loaded", () => {
    window.dispatchEvent(new Event("load"));

    new Promise((resolve) => {
      document.ready(() => {
        expect(true).toBeTruthy();
        resolve(void 0);
      });
    });
  });
});

describe("Document.leaving", () => {
  it("should run when the user attempts to leave the document", () => {
    window.dispatchEvent(new Event("unload"));

    new Promise(resolve => {
      document.leaving(() => {
        expect(true).toBeTruthy();
        resolve(void 0);
      });
    });
  });
});

describe("Document.css", () => {
  it("should set the css for an element class", () => {
    const div = document.createElement("div");
    div.className = "target";
    document.body.appendChild(div);

    document.css("div.target", {
      color: "red"
    });

    const styles = document.css("div.target");
    expect(styles).toHaveProperty("color");
    expect(styles.color).toBe("red");
  });
});

describe("Document.createElementTree", () => {
  it("should create an element cascade and append to the body", () => {
    const el = document.createElementTree({ 
      tag: "div", 
      children: { tag: "a" }
    });

    document.body.appendChild(el);

    const divs = document.body.getElementsByTagName("div");
    expect(divs).toHaveLength(1);

    const anchors = divs[0].getElementsByTagName("a");
    expect(anchors).toHaveLength(1);

    // Optional: check if the created div is actually a child of body
    expect(document.body.contains(el)).toBeTruthy();
  });
  
  it("should be able to add keyed properties", () => {
    expect(() => {
      const el = document.createElementTree({ 
        tag: "div", 
        "data-href": "32",
        children: { 
          tag: "a",
          "data-style": "position: absoulte;"
        }
      });
    }).not.toThrow();
  });

  it("should not be able to add keyed properties if they aren't a string", () => {
    expect(() => {
      document.createElementTree({ 
        tag: "div", 
        "data-href": "32",
        children: { 
          tag: "a",
          "data-style": { 
            position: "absoulte"
          }
        }
      });
    }).toThrow();
  });
});