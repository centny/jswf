var path = require("path");

function showlog() {
  browser.manage().logs().get('browser').then(function(browserLogs) {
    browserLogs.forEach(function(log) {
      console.log(log.level.name + " " + log.message);
    });
  });
}
describe('TestUpload', function() {
  //
  var abc1;
  var abc1_res;
  var abc1_start;
  var cls_btn;

  var testf_1 = path.resolve('.', "www/test/e2e/jsup1.txt");
  var testf_1_sha = "a9993e364706816aba3e25717850c26c9cd0d89d";
  var testf_2 = path.resolve('.', "www/test/e2e/jsup2.txt");
  var testf_2_sha = "f480c3d09a5a00d5961fecffa615b5a2efa549f2";

  function init_e() {
    abc1 = element(by.id('abc1'));
    abc1_res = element(by.id('abc1_res'));
    abc1_start = element(by.id('abc1_start'));
    cls_btn = element(by.id('cls_btn'));
  }
  beforeEach(function() {
    browser.get('http://127.0.0.1:7899/jsup/test/web/jsup_test.html');
    init_e();
  });
  //
  it('testSimpleUpload1...', function() {
    //
    browser.driver.executeScript("testSimpleUpload1()");
    abc1.sendKeys(testf_1);
    abc1_res.getInnerHtml().then(function(el) {
      expect(el).toBe(testf_1_sha);
    });
    abc1.sendKeys(testf_2);
    abc1_res.getInnerHtml().then(function(el) {
      expect(el).toBe(testf_2_sha);
    });
    cls_btn.click();
  });
  it('testSimpleUpload2...', function() {
    //
    browser.driver.executeScript("testSimpleUpload2()");
    abc1.sendKeys(testf_1);
    abc1_start.click();
    abc1_res.getInnerHtml().then(function(el) {
      expect(el).toBe(testf_1_sha);
    });
    abc1.sendKeys(testf_2);
    abc1_start.click();
    abc1_res.getInnerHtml().then(function(el) {
      expect(el).toBe(testf_2_sha);
    });
    // browser.driver.sleep(100000);
    abc1.sendKeys(testf_1);
    abc1_start.click();
    abc1_res.getInnerHtml().then(function(el) {
      expect(el).toBe(testf_1_sha);
    });
    cls_btn.click();
  });
  it('testAbort1...', function() {
    //
    browser.driver.executeScript("testAbort1()");
    abc1.sendKeys(testf_1);
    abc1_res.getInnerHtml().then(function(el) {
      expect(el).toBe("OK");
    });
  });
  it('testErr1...', function() {
    //
    browser.driver.executeScript("testErr1()");
    abc1.sendKeys(testf_1);
    abc1_res.getInnerHtml().then(function(el) {
      expect(el).toBe("OK");
    });
  });
  it('testSelectFileErr...', function() {
    //
    browser.driver.executeScript("testSelectFileErr()");
    abc1.sendKeys(testf_1);
    abc1_res.getInnerHtml().then(function(el) {
      expect(el).toBe("1");
    });
    abc1.sendKeys(testf_2);
    abc1_res.getInnerHtml().then(function(el) {
      expect(el).toBe("2");
    });
  });
  it('testSome1...', function() {
    //
    browser.driver.executeScript("testSome1()");
  });
  it('testStatusText...', function() {
    //
    browser.driver.executeScript("testStatusText()");
  });
  //
  it('All end...', function() {
    console.log("All end");
  });
  afterEach(function() {
    showlog();
  });
});