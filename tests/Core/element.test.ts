describe("Element.hasText", () => {
  let element: Element;

  beforeEach(() => {
    element = document.createElement('div');
  });

  it("should return true if the text matches", () => {
    element.textContent = "Hello, World!";
    expect(element.hasText("Hello, World!")).toBeTruthy();
  });

  it("should return false if the test does not match", () => {
    element.textContent = "Hello, World!";
    expect(element.hasText("Hello World!")).toBeFalsy();
  });
});

describe("Element.txt", () => {
  let element: Element;

  beforeEach(() => {
    element = document.createElement('div');
  });

  it("should set text content", () => {
    element.txt("Test");
    expect(element.textContent).toBe("Test");
  });

  it("should get text content", () => {
    element.textContent = "Hello";
    expect(element.txt()).toBe("Hello");
  });
});

describe("Element.addClass", () => {
  let element: Element;

  beforeEach(() => {
    element = document.createElement('div');
  });

  it("should add a class to the element", () => {
    element.addClass('test-class');
    expect(element.classList.contains('test-class')).toBeTruthy();
  });
});

describe("Element.removeClass", () => {
  let element: Element;

  beforeEach(() => {
    element = document.createElement('div');
    element.classList.add('test-class');
  });

  it("should remove a class from the element", () => {
    element.removeClass('test-class');
    expect(element.classList.contains('test-class')).toBeFalsy();
  });
});

describe("Element.toggleClass", () => {
  let element: Element;

  beforeEach(() => {
    element = document.createElement('div');
  });

  it("should toggle a class on the element", () => {
    element.toggleClass('test-class');
    expect(element.classList.contains('test-class')).toBeTruthy();
    element.toggleClass('test-class');
    expect(element.classList.contains('test-class')).toBeFalsy();
  });
});

describe("Element.hasClass", () => {
  let element: Element;

  beforeEach(() => {
    element = document.createElement('div');
  });

  it("should return true if the element has the specified class", () => {
    element.classList.add('test-class');
    expect(element.hasClass('test-class')).toBeTruthy();
  });

  it("should return false if the element does not have the specified class", () => {
    expect(element.hasClass('test-class')).toBeFalsy();
  });
});

describe("HTMLElement.css", () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = document.createElement('div');
  });

  it("should apply CSS styles to the element", () => {
    element.css({ color: 'red' });
    expect(element.style.color).toBe('red');
  });
});

describe("HTMLElement.tag", () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = document.createElement('div');
  });

  it("should return the tag name of the element", () => {
    const tagName = element.tag();
    expect(tagName).toBe('div');
  });
});

describe("HTMLElement.html", () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = document.createElement('div');
  });

  it("should set inner HTML content", () => {
    element.html('<p>Hello</p>');
    expect(element.innerHTML).toBe('<p>Hello</p>');
  });
});

describe("HTMLElement.show", () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = document.createElement('div');
  });

  it("should show the element", () => {
    element.hide(); // first hide
    element.show();
    expect(element.style.visibility).toBe('visible');
  });
});

describe("HTMLElement.hide", () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = document.createElement('div');
  });

  it("should hide the element", () => {
    element.show(); // first show
    element.hide();
    expect(element.style.visibility).toBe('hidden');
  });
});

describe("HTMLElement.toggle", () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = document.createElement('div');
  });

  it("should toggle the visibility of the element", () => {
    element.toggle();
    expect(element.style.visibility).toBe('hidden');
    element.toggle();
    expect(element.style.visibility).toBe('visible');
  });
});

describe("HTMLFormElement.serialize", () => {
  let el: HTMLFormElement;

  beforeEach(() => {
    el = document.createElement("form");
    document.body.append(el); // just in case serialization needs to be in DOM
  });

  afterEach(() => {
    el.remove(); // clean that up like a pro
  });

  it("should return empty string for empty form", () => {
    expect(el.serialize()).toBe("");
  });

  it("should serialize single input", () => {
    const input = document.createElement("input");
    input.name = "username";
    input.value = "broski";
    el.append(input);
    expect(el.serialize()).toBe("username=broski");
  });

  it("should serialize multiple inputs", () => {
    const el = document.createElement("form");
    
    const user = document.createElement("input");
    user.name = "user";
    user.value = "broski";

    const age = document.createElement("input");
    age.name = "age";
    age.value = "15";

    el.append(user, age);
    expect(el.serialize()).toBe("user=broski&age=15");
  });

  it("should skip inputs without name", () => {
    const skip = document.createElement("input");
    skip.value = "npc";

    const keep = document.createElement("input");
    keep.name = "real";
    keep.value = "W";

    el.append(skip, keep);
    expect(el.serialize()).toBe("real=W");
  });

  it("should only serialize checked checkboxes", () => {
    const cb1 = document.createElement("input");
    cb1.type = "checkbox";
    cb1.name = "sub";
    cb1.value = "yes";
    cb1.checked = true;

    const cb2 = document.createElement("input");
    cb2.type = "checkbox";
    cb2.name = "sub";
    cb2.value = "no";
    cb2.checked = false;

    el.append(cb1, cb2);
    expect(el.serialize()).toBe("sub=yes");
  });

  it("should only include selected radio", () => {
    const r1 = document.createElement("input");
    r1.type = "radio";
    r1.name = "plan";
    r1.value = "basic";

    const r2 = document.createElement("input");
    r2.type = "radio";
    r2.name = "plan";
    r2.value = "premium";
    r2.checked = true;

    el.append(r1, r2);
    expect(el.serialize()).toBe("plan=premium");
  });

  it("should URL-encode keys and values", () => {
    const input = document.createElement("input");
    input.name = "user name";
    input.value = "bro ski";

    el.append(input);
    expect(el.serialize()).toBe("user%20name=bro%20ski");
  });
});