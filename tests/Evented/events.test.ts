describe("EventTarget.addBoundListener", () => {
  it("should cancel the listener after `x` amount of times", () => {
    const div = document.createElement("div");
    document.body.append(div);

    let count = 0;

    div.addBoundListener("click", () => {
      count++;
    }, 2); // Only allow the listener to run twice

    div.click();
    div.click();
    div.click(); // This one should not increase the count

    expect(count).toBe(2);
  });

  it("should cancel the listener when the condition specified returns true", () => {
    const div = document.createElement("div");
    document.body.append(div);

    let ran = false;

    div.addBoundListener("click", () => {
      ran = true;
    }, () => ran);
  });
});

describe("EventTarget.addEventListeners", () => {
  it("should attach multiple event listeners to the object", () => {
    let flag1 = false;
    let flag2 = false;

    const multi = document.createElement("div");
    document.body.appendChild(multi);

    multi.addEventListeners({
      click: () => flag1 = true,
      mouseover: () =>  flag2 = true
    });

    multi.dispatchEvent(new MouseEvent("mouseover"));
    multi.dispatchEvent(new MouseEvent("click"));

    expect(flag1).toBeTruthy();
    expect(flag2).toBeTruthy();
  });

  it("should attach multiple event listeners to the object", () => {
    const single = document.createElement("div");
    document.body.appendChild(single);

    let flag = 0;
    single.addEventListeners(["mouseover", "click"], () => {
      flag++;
    });

    single.dispatchEvent(new MouseEvent("mouseover"));
    single.dispatchEvent(new MouseEvent("click"));

    expect(flag).toBe(2);
  });
});

describe("NodeList.addEventListener", () => {
  let nodeList: NodeList;

  beforeEach(() => {
    document.body.append(document.createElement('div'));
    document.body.append(document.createElement('div'));
    nodeList = document.querySelectorAll('div');
  });

  it("should be defined", () => {
    expect(nodeList.addEventListener).toBeDefined();
  });
});

describe("HTMLCollection.addEventListener", () => {
  let htmlCollection: HTMLCollectionOf<HTMLDivElement>;

  beforeEach(() => {
    document.body.append(document.createElement('div'));
    document.body.append(document.createElement('div'));
    htmlCollection = document.getElementsByTagName('div');
  });

  it("should be defined", () => {
    expect((htmlCollection as any).addEventListener).toBeDefined();
  });
});