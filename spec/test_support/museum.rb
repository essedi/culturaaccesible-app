module Page
  class Museum
    include Capybara::DSL

    def initialize
      url = '/'
      visit(url)
      go_to_museum_detail
      validate!
    end

    def title?
      has_content?('Museum detail')
    end

    private

    def go_to_museum_detail
      find('.bar-button-menutoggle').click
      sleep 1
      find('#museum').click
    end

    def validate!
      assert_selector('.bar-button-menutoggle')
      assert_selector('#museum', visible: false)
      assert_selector('#name')
      assert_selector('#info')
    end
  end
end
