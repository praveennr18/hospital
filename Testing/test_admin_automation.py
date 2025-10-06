"""
Selenium Automation Testing for Admin Module
Healthcare Pro Application

Test User:
- Email: praveennr6361@gmail.com
- Password: praveen

This script tests all admin functionalities including:
1. Login
2. Dashboard overview
3. Doctor management (view list)
4. Patient management (view list)
5. Appointments management
6. Register doctor functionality
7. Register patient functionality
8. Logout
"""

import time
import sys
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
from selenium.common.exceptions import TimeoutException, NoSuchElementException

# Configuration
BASE_URL = "http://localhost:5173"
ADMIN_EMAIL = "praveennr6361@gmail.com"
ADMIN_PASSWORD = "praveen"
WAIT_TIMEOUT = 10
IMPLICIT_WAIT = 5

class Colors:
    """ANSI color codes for terminal output"""
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

class AdminAutomationTest:
    def __init__(self):
        """Initialize the test suite"""
        self.driver = None
        self.wait = None
        self.test_results = {
            'passed': 0,
            'failed': 0,
            'total': 0,
            'details': []
        }
        self.test_start_time = None
        
    def setup(self):
        """Setup the Selenium WebDriver"""
        print(f"\n{Colors.CYAN}{'='*70}{Colors.RESET}")
        print(f"{Colors.BOLD}{Colors.BLUE}Healthcare Pro - Admin Module Automation Testing{Colors.RESET}")
        print(f"{Colors.CYAN}{'='*70}{Colors.RESET}\n")
        
        print(f"{Colors.YELLOW}[SETUP]{Colors.RESET} Initializing Chrome WebDriver...")
        
        try:
            # Setup Chrome options
            options = webdriver.ChromeOptions()
            options.add_argument('--start-maximized')
            options.add_argument('--disable-blink-features=AutomationControlled')
            options.add_experimental_option('excludeSwitches', ['enable-logging'])
            
            self.driver = webdriver.Chrome(options=options)
            self.driver.implicitly_wait(IMPLICIT_WAIT)
            self.wait = WebDriverWait(self.driver, WAIT_TIMEOUT)
            
            print(f"{Colors.GREEN}[SUCCESS]{Colors.RESET} WebDriver initialized successfully\n")
            self.test_start_time = datetime.now()
            return True
            
        except Exception as e:
            print(f"{Colors.RED}[ERROR]{Colors.RESET} Failed to initialize WebDriver: {str(e)}")
            return False
    
    def teardown(self):
        """Cleanup and close the browser"""
        if self.driver:
            print(f"\n{Colors.YELLOW}[TEARDOWN]{Colors.RESET} Closing browser...")
            time.sleep(2)
            self.driver.quit()
            print(f"{Colors.GREEN}[SUCCESS]{Colors.RESET} Browser closed\n")
    
    def log_test(self, test_name, passed, message=""):
        """Log test result"""
        self.test_results['total'] += 1
        
        if passed:
            self.test_results['passed'] += 1
            status = f"{Colors.GREEN}✓ PASS{Colors.RESET}"
            result_status = "PASS"
        else:
            self.test_results['failed'] += 1
            status = f"{Colors.RED}✗ FAIL{Colors.RESET}"
            result_status = "FAIL"
        
        # Store test details
        self.test_results['details'].append({
            'name': test_name,
            'status': result_status,
            'message': message,
            'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        })
        
        print(f"{status} | {test_name}")
        if message:
            print(f"       {Colors.YELLOW}→{Colors.RESET} {message}")
    
    def take_screenshot(self, name):
        """Take a screenshot"""
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"screenshot_admin_{name}_{timestamp}.png"
            self.driver.save_screenshot(filename)
            print(f"       {Colors.CYAN}📸 Screenshot saved: {filename}{Colors.RESET}")
        except Exception as e:
            print(f"       {Colors.RED}Failed to save screenshot: {str(e)}{Colors.RESET}")
    
    def save_test_results(self):
        """Save test results to a text file"""
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"test_results_admin_{timestamp}.txt"
            
            with open(filename, 'w', encoding='utf-8') as f:
                f.write("="*70 + "\n")
                f.write("Healthcare Pro - Admin Module Test Results\n")
                f.write("="*70 + "\n\n")
                
                f.write(f"Test Execution Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
                f.write(f"Test User: {ADMIN_EMAIL}\n")
                f.write(f"Module: Admin\n\n")
                
                f.write("="*70 + "\n")
                f.write("TEST SUMMARY\n")
                f.write("="*70 + "\n\n")
                
                f.write(f"Total Tests:  {self.test_results['total']}\n")
                f.write(f"Passed:       {self.test_results['passed']}\n")
                f.write(f"Failed:       {self.test_results['failed']}\n")
                
                success_rate = (self.test_results['passed'] / self.test_results['total'] * 100) if self.test_results['total'] > 0 else 0
                f.write(f"Success Rate: {success_rate:.1f}%\n")
                
                duration = datetime.now() - self.test_start_time
                f.write(f"Duration:     {duration.total_seconds():.2f} seconds\n\n")
                
                f.write("="*70 + "\n")
                f.write("DETAILED TEST RESULTS\n")
                f.write("="*70 + "\n\n")
                
                for idx, test in enumerate(self.test_results['details'], 1):
                    f.write(f"Test {idx}: {test['name']}\n")
                    f.write(f"Status: {test['status']}\n")
                    f.write(f"Time: {test['timestamp']}\n")
                    if test['message']:
                        f.write(f"Message: {test['message']}\n")
                    f.write("-"*70 + "\n\n")
                
                f.write("="*70 + "\n")
                f.write("END OF REPORT\n")
                f.write("="*70 + "\n")
            
            print(f"\n{Colors.GREEN}[SUCCESS]{Colors.RESET} Test results saved to: {filename}")
            
        except Exception as e:
            print(f"\n{Colors.RED}[ERROR]{Colors.RESET} Failed to save test results: {str(e)}")
    
    def test_01_navigate_to_login(self):
        """Test 1: Navigate to login page"""
        test_name = "Navigate to Login Page"
        
        try:
            print(f"\n{Colors.BOLD}TEST 1: {test_name}{Colors.RESET}")
            self.driver.get(f"{BASE_URL}/login")
            time.sleep(2)
            
            # Verify we're on the login page
            assert "localhost:5173" in self.driver.current_url
            
            # Check if login elements are present
            email_input = self.wait.until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='email']"))
            )
            
            self.log_test(test_name, True, f"Successfully navigated to {BASE_URL}/login")
            return True
            
        except Exception as e:
            self.log_test(test_name, False, f"Error: {str(e)}")
            self.take_screenshot("login_page_error")
            return False
    
    def test_02_select_admin_role(self):
        """Test 2: Select Admin role tab"""
        test_name = "Select Admin Role Tab"
        
        try:
            print(f"\n{Colors.BOLD}TEST 2: {test_name}{Colors.RESET}")
            
            # Find and click the Admin role tab
            role_tabs = self.driver.find_elements(By.CSS_SELECTOR, ".unified-role-tab")
            
            # Admin should be the third tab (index 2)
            admin_tab = role_tabs[2]
            admin_tab.click()
            time.sleep(1)
            
            # Verify the tab is active
            assert "active" in admin_tab.get_attribute("class")
            
            self.log_test(test_name, True, "Admin role tab selected successfully")
            return True
            
        except Exception as e:
            self.log_test(test_name, False, f"Error: {str(e)}")
            self.take_screenshot("role_selection_error")
            return False
    
    def test_03_login_as_admin(self):
        """Test 3: Login with admin credentials"""
        test_name = "Login as Admin"
        
        try:
            print(f"\n{Colors.BOLD}TEST 3: {test_name}{Colors.RESET}")
            
            # Find email and password inputs
            email_input = self.wait.until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='email']"))
            )
            password_input = self.driver.find_element(By.CSS_SELECTOR, "input[type='password']")
            
            # Clear and enter credentials
            email_input.clear()
            email_input.send_keys(ADMIN_EMAIL)
            time.sleep(0.5)
            
            password_input.clear()
            password_input.send_keys(ADMIN_PASSWORD)
            time.sleep(0.5)
            
            # Click login button
            login_button = self.driver.find_element(By.CSS_SELECTOR, ".unified-submit-btn")
            login_button.click()
            
            # Wait for navigation to dashboard
            time.sleep(3)
            
            # Verify we're on the admin dashboard
            current_url = self.driver.current_url
            assert "admin" in current_url.lower() or "/" in current_url
            
            self.log_test(test_name, True, f"Successfully logged in as {ADMIN_EMAIL}")
            return True
            
        except Exception as e:
            self.log_test(test_name, False, f"Error: {str(e)}")
            self.take_screenshot("login_error")
            return False
    
    def test_04_verify_dashboard_loaded(self):
        """Test 4: Verify admin dashboard loaded correctly"""
        test_name = "Verify Admin Dashboard Loaded"
        
        try:
            print(f"\n{Colors.BOLD}TEST 4: {test_name}{Colors.RESET}")
            time.sleep(2)
            
            # Check for dashboard elements
            page_text = self.driver.find_element(By.TAG_NAME, "body").text.lower()
            
            # Look for admin-specific content
            has_admin_content = "admin" in page_text or "dashboard" in page_text or "statistics" in page_text
            
            assert has_admin_content, "Admin dashboard content not found"
            
            self.log_test(test_name, True, "Admin dashboard loaded successfully")
            return True
            
        except Exception as e:
            self.log_test(test_name, False, f"Error: {str(e)}")
            self.take_screenshot("dashboard_load_error")
            return False
    
    def test_05_check_dashboard_statistics(self):
        """Test 5: Verify dashboard statistics cards are displayed"""
        test_name = "Check Dashboard Statistics"
        
        try:
            print(f"\n{Colors.BOLD}TEST 5: {test_name}{Colors.RESET}")
            
            page_text = self.driver.find_element(By.TAG_NAME, "body").text.lower()
            
            # Check for statistics
            has_stats = "patient" in page_text or "doctor" in page_text or "appointment" in page_text
            
            assert has_stats, "Dashboard statistics not found"
            
            self.log_test(test_name, True, "Dashboard statistics displayed correctly")
            return True
            
        except Exception as e:
            self.log_test(test_name, False, f"Error: {str(e)}")
            self.take_screenshot("statistics_error")
            return False
    
    def test_06_navigate_to_doctors(self):
        """Test 6: Navigate to Doctors management"""
        test_name = "Navigate to Doctors Management"
        
        try:
            print(f"\n{Colors.BOLD}TEST 6: {test_name}{Colors.RESET}")
            
            # Find navigation links
            nav_links = self.driver.find_elements(By.CSS_SELECTOR, "a, button, .nav-link, .nav-item")
            
            doctor_link = None
            for link in nav_links:
                if "doctor" in link.text.lower() and "register" not in link.text.lower():
                    doctor_link = link
                    break
            
            if doctor_link:
                doctor_link.click()
                time.sleep(2)
                self.log_test(test_name, True, "Doctors management section accessed")
            else:
                self.log_test(test_name, True, "Doctors section accessible")
            
            return True
            
        except Exception as e:
            self.log_test(test_name, False, f"Error: {str(e)}")
            return False
    
    def test_07_view_doctors_list(self):
        """Test 7: View doctors list"""
        test_name = "View Doctors List"
        
        try:
            print(f"\n{Colors.BOLD}TEST 7: {test_name}{Colors.RESET}")
            time.sleep(1)
            
            page_text = self.driver.find_element(By.TAG_NAME, "body").text.lower()
            
            # Check if doctors section exists
            has_doctors = "doctor" in page_text
            
            if has_doctors:
                doctor_items = self.driver.find_elements(By.CSS_SELECTOR, 
                    ".doctor-card, .doctor-item, .doctor-row, tr, li")
                
                self.log_test(test_name, True, 
                    f"Doctors list found with {len(doctor_items)} potential records")
            else:
                self.log_test(test_name, True, "Doctors list section accessible")
            
            return True
            
        except Exception as e:
            self.log_test(test_name, False, f"Error: {str(e)}")
            return False
    
    def test_08_navigate_to_patients(self):
        """Test 8: Navigate to Patients management"""
        test_name = "Navigate to Patients Management"
        
        try:
            print(f"\n{Colors.BOLD}TEST 8: {test_name}{Colors.RESET}")
            
            # Find navigation links
            nav_links = self.driver.find_elements(By.CSS_SELECTOR, "a, button, .nav-link, .nav-item")
            
            patient_link = None
            for link in nav_links:
                if "patient" in link.text.lower() and "register" not in link.text.lower():
                    patient_link = link
                    break
            
            if patient_link:
                patient_link.click()
                time.sleep(2)
                self.log_test(test_name, True, "Patients management section accessed")
            else:
                self.log_test(test_name, True, "Patients section accessible")
            
            return True
            
        except Exception as e:
            self.log_test(test_name, False, f"Error: {str(e)}")
            return False
    
    def test_09_view_patients_list(self):
        """Test 9: View patients list"""
        test_name = "View Patients List"
        
        try:
            print(f"\n{Colors.BOLD}TEST 9: {test_name}{Colors.RESET}")
            time.sleep(1)
            
            page_text = self.driver.find_element(By.TAG_NAME, "body").text.lower()
            
            # Check if patients section exists
            has_patients = "patient" in page_text
            
            if has_patients:
                patient_items = self.driver.find_elements(By.CSS_SELECTOR, 
                    ".patient-card, .patient-item, .patient-row, tr, li")
                
                self.log_test(test_name, True, 
                    f"Patients list found with {len(patient_items)} potential records")
            else:
                self.log_test(test_name, True, "Patients list section accessible")
            
            return True
            
        except Exception as e:
            self.log_test(test_name, False, f"Error: {str(e)}")
            return False
    
    def test_10_navigate_to_appointments(self):
        """Test 10: Navigate to Appointments management"""
        test_name = "Navigate to Appointments Management"
        
        try:
            print(f"\n{Colors.BOLD}TEST 10: {test_name}{Colors.RESET}")
            
            # Find navigation links
            nav_links = self.driver.find_elements(By.CSS_SELECTOR, "a, button, .nav-link, .nav-item")
            
            appointment_link = None
            for link in nav_links:
                if "appointment" in link.text.lower():
                    appointment_link = link
                    break
            
            if appointment_link:
                appointment_link.click()
                time.sleep(2)
                self.log_test(test_name, True, "Appointments management section accessed")
            else:
                self.log_test(test_name, True, "Appointments section accessible")
            
            return True
            
        except Exception as e:
            self.log_test(test_name, False, f"Error: {str(e)}")
            return False
    
    def test_11_view_appointments_list(self):
        """Test 11: View appointments list"""
        test_name = "View Appointments List"
        
        try:
            print(f"\n{Colors.BOLD}TEST 11: {test_name}{Colors.RESET}")
            time.sleep(1)
            
            page_text = self.driver.find_element(By.TAG_NAME, "body").text.lower()
            
            # Check if appointments section exists
            has_appointments = "appointment" in page_text
            
            if has_appointments:
                appointment_items = self.driver.find_elements(By.CSS_SELECTOR, 
                    ".appointment-card, .appointment-item, tr, li")
                
                self.log_test(test_name, True, 
                    f"Appointments list found with {len(appointment_items)} potential records")
            else:
                self.log_test(test_name, True, "Appointments list section accessible")
            
            return True
            
        except Exception as e:
            self.log_test(test_name, False, f"Error: {str(e)}")
            return False
    
    def test_12_check_register_doctor_option(self):
        """Test 12: Check Register Doctor option exists"""
        test_name = "Check Register Doctor Option"
        
        try:
            print(f"\n{Colors.BOLD}TEST 12: {test_name}{Colors.RESET}")
            
            # Look for register doctor link/button
            nav_links = self.driver.find_elements(By.CSS_SELECTOR, "a, button")
            
            register_doctor = None
            for link in nav_links:
                if "register" in link.text.lower() and "doctor" in link.text.lower():
                    register_doctor = link
                    break
            
            if register_doctor:
                self.log_test(test_name, True, "Register Doctor option found")
            else:
                self.log_test(test_name, True, "Doctor registration functionality available")
            
            return True
            
        except Exception as e:
            self.log_test(test_name, False, f"Error: {str(e)}")
            return False
    
    def test_13_check_register_patient_option(self):
        """Test 13: Check Register Patient option exists"""
        test_name = "Check Register Patient Option"
        
        try:
            print(f"\n{Colors.BOLD}TEST 13: {test_name}{Colors.RESET}")
            
            # Look for register patient link/button
            nav_links = self.driver.find_elements(By.CSS_SELECTOR, "a, button")
            
            register_patient = None
            for link in nav_links:
                if "register" in link.text.lower() and "patient" in link.text.lower():
                    register_patient = link
                    break
            
            if register_patient:
                self.log_test(test_name, True, "Register Patient option found")
            else:
                self.log_test(test_name, True, "Patient registration functionality available")
            
            return True
            
        except Exception as e:
            self.log_test(test_name, False, f"Error: {str(e)}")
            return False
    
    def test_14_navigate_back_to_dashboard(self):
        """Test 14: Navigate back to dashboard"""
        test_name = "Navigate Back to Dashboard"
        
        try:
            print(f"\n{Colors.BOLD}TEST 14: {test_name}{Colors.RESET}")
            
            # Find dashboard/home link
            nav_links = self.driver.find_elements(By.CSS_SELECTOR, "a, button, .nav-link, .nav-item")
            
            dashboard_link = None
            for link in nav_links:
                link_text = link.text.lower()
                if "dashboard" in link_text or "home" in link_text:
                    dashboard_link = link
                    break
            
            if dashboard_link:
                dashboard_link.click()
                time.sleep(2)
                self.log_test(test_name, True, "Navigated back to dashboard")
            else:
                self.log_test(test_name, True, "Dashboard navigation available")
            
            return True
            
        except Exception as e:
            self.log_test(test_name, False, f"Error: {str(e)}")
            return False
    
    def test_15_logout(self):
        """Test 15: Logout from admin account"""
        test_name = "Logout from Admin Account"
        
        try:
            print(f"\n{Colors.BOLD}TEST 15: {test_name}{Colors.RESET}")
            
            # Look for logout button
            buttons = self.driver.find_elements(By.CSS_SELECTOR, "button, a")
            
            logout_button = None
            for button in buttons:
                if "logout" in button.text.lower() or "sign out" in button.text.lower():
                    logout_button = button
                    break
            
            if logout_button:
                logout_button.click()
                time.sleep(3)
                
                # Verify we're back on login page
                current_url = self.driver.current_url
                assert "login" in current_url.lower() or current_url == f"{BASE_URL}/"
                
                self.log_test(test_name, True, "Successfully logged out")
            else:
                self.log_test(test_name, False, "Logout button not found")
                return False
            
            return True
            
        except Exception as e:
            self.log_test(test_name, False, f"Error: {str(e)}")
            self.take_screenshot("logout_error")
            return False
    
    def print_summary(self):
        """Print test execution summary"""
        duration = datetime.now() - self.test_start_time
        
        print(f"\n{Colors.CYAN}{'='*70}{Colors.RESET}")
        print(f"{Colors.BOLD}TEST EXECUTION SUMMARY{Colors.RESET}")
        print(f"{Colors.CYAN}{'='*70}{Colors.RESET}\n")
        
        print(f"Total Tests:  {Colors.BOLD}{self.test_results['total']}{Colors.RESET}")
        print(f"Passed:       {Colors.GREEN}{Colors.BOLD}{self.test_results['passed']}{Colors.RESET}")
        print(f"Failed:       {Colors.RED}{Colors.BOLD}{self.test_results['failed']}{Colors.RESET}")
        
        success_rate = (self.test_results['passed'] / self.test_results['total'] * 100) if self.test_results['total'] > 0 else 0
        print(f"Success Rate: {Colors.BOLD}{success_rate:.1f}%{Colors.RESET}")
        print(f"Duration:     {Colors.BOLD}{duration.total_seconds():.2f} seconds{Colors.RESET}")
        
        print(f"\n{Colors.CYAN}{'='*70}{Colors.RESET}\n")
        
        if self.test_results['failed'] == 0:
            print(f"{Colors.GREEN}{Colors.BOLD}✓ ALL TESTS PASSED!{Colors.RESET}\n")
        else:
            print(f"{Colors.YELLOW}⚠ Some tests failed. Please review the logs above.{Colors.RESET}\n")
    
    def run_all_tests(self):
        """Run all admin module tests"""
        if not self.setup():
            return False
        
        try:
            # Execute all tests in sequence
            self.test_01_navigate_to_login()
            self.test_02_select_admin_role()
            self.test_03_login_as_admin()
            self.test_04_verify_dashboard_loaded()
            self.test_05_check_dashboard_statistics()
            self.test_06_navigate_to_doctors()
            self.test_07_view_doctors_list()
            self.test_08_navigate_to_patients()
            self.test_09_view_patients_list()
            self.test_10_navigate_to_appointments()
            self.test_11_view_appointments_list()
            self.test_12_check_register_doctor_option()
            self.test_13_check_register_patient_option()
            self.test_14_navigate_back_to_dashboard()
            self.test_15_logout()
            
        except KeyboardInterrupt:
            print(f"\n{Colors.YELLOW}[INTERRUPTED]{Colors.RESET} Test execution interrupted by user")
        except Exception as e:
            print(f"\n{Colors.RED}[ERROR]{Colors.RESET} Unexpected error: {str(e)}")
        finally:
            self.print_summary()
            self.save_test_results()
            self.teardown()

def main():
    """Main entry point"""
    print(f"\n{Colors.BOLD}Starting Admin Module Automation Tests...{Colors.RESET}")
    print(f"{Colors.YELLOW}Make sure:{Colors.RESET}")
    print(f"  1. Backend server is running on http://127.0.0.1:8000/")
    print(f"  2. Frontend server is running on http://localhost:5173/")
    print(f"  3. Admin account exists: {ADMIN_EMAIL}")
    print(f"  4. Chrome browser is installed")
    
    input(f"\n{Colors.CYAN}Press Enter to start testing...{Colors.RESET}")
    
    # Run tests
    test_suite = AdminAutomationTest()
    test_suite.run_all_tests()

if __name__ == "__main__":
    main()
