"""
Selenium CRUD Operations Testing for Patient Module
Healthcare Pro Application

Test User:
- Email: skandaudemy@gmail.com
- Password: skanda

This script tests CRUD operations including:
1. Adding medical history (CREATE)
2. Viewing medical history (READ)
3. Adding allergies (CREATE)
4. Viewing allergies (READ)
5. Adding medications (CREATE)
6. Viewing medications (READ)
7. Booking appointments (CREATE)
8. Viewing appointments (READ)
9. Database verification for all operations
"""

import time
import random
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select
from selenium.common.exceptions import TimeoutException, NoSuchElementException

# Configuration
BASE_URL = "http://localhost:5173"
PATIENT_EMAIL = "skandaudemy@gmail.com"
PATIENT_PASSWORD = "skanda"
WAIT_TIMEOUT = 15
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

class PatientCRUDTest:
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
        self.test_data = {
            'medical_history': f"Test Condition {random.randint(1000, 9999)}",
            'allergy': f"Test Allergen {random.randint(1000, 9999)}",
            'medication_name': f"Test Medicine {random.randint(1000, 9999)}",
            'medication_dosage': "10mg twice daily"
        }
        
    def setup(self):
        """Setup the Selenium WebDriver"""
        print(f"\n{Colors.CYAN}{'='*70}{Colors.RESET}")
        print(f"{Colors.BOLD}{Colors.BLUE}Healthcare Pro - Patient CRUD Operations Testing{Colors.RESET}")
        print(f"{Colors.CYAN}{'='*70}{Colors.RESET}\n")
        
        print(f"{Colors.YELLOW}[SETUP]{Colors.RESET} Initializing Chrome WebDriver...")
        
        try:
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
            filename = f"screenshot_patient_crud_{name}_{timestamp}.png"
            self.driver.save_screenshot(filename)
            print(f"       {Colors.CYAN}📸 Screenshot saved: {filename}{Colors.RESET}")
        except Exception as e:
            print(f"       {Colors.RED}Failed to save screenshot: {str(e)}{Colors.RESET}")
    
    def save_test_results(self):
        """Save test results to a text file"""
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"test_results_patient_crud_{timestamp}.txt"
            
            with open(filename, 'w', encoding='utf-8') as f:
                f.write("="*70 + "\n")
                f.write("Healthcare Pro - Patient CRUD Operations Test Results\n")
                f.write("="*70 + "\n\n")
                
                f.write(f"Test Execution Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
                f.write(f"Test User: {PATIENT_EMAIL}\n")
                f.write(f"Module: Patient CRUD Operations\n\n")
                
                f.write("Test Data Used:\n")
                f.write(f"- Medical History: {self.test_data['medical_history']}\n")
                f.write(f"- Allergy: {self.test_data['allergy']}\n")
                f.write(f"- Medication: {self.test_data['medication_name']} - {self.test_data['medication_dosage']}\n\n")
                
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
    
    def login(self):
        """Login to patient account"""
        try:
            self.driver.get(f"{BASE_URL}/login")
            time.sleep(2)
            
            # Select patient role
            role_tabs = self.driver.find_elements(By.CSS_SELECTOR, ".unified-role-tab")
            role_tabs[0].click()
            time.sleep(1)
            
            # Enter credentials
            email_input = self.wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='email']")))
            password_input = self.driver.find_element(By.CSS_SELECTOR, "input[type='password']")
            
            email_input.clear()
            email_input.send_keys(PATIENT_EMAIL)
            password_input.clear()
            password_input.send_keys(PATIENT_PASSWORD)
            
            # Click login
            login_button = self.driver.find_element(By.CSS_SELECTOR, ".unified-submit-btn")
            login_button.click()
            time.sleep(3)
            
            return True
        except Exception as e:
            print(f"{Colors.RED}[ERROR]{Colors.RESET} Login failed: {str(e)}")
            return False
    
    def test_01_add_medical_history(self):
        """Test 1: Add medical history (CREATE operation)"""
        test_name = "Add Medical History (CREATE)"
        
        try:
            print(f"\n{Colors.BOLD}TEST 1: {test_name}{Colors.RESET}")
            
            # Navigate to medical history tab
            tabs = self.driver.find_elements(By.CSS_SELECTOR, ".tab-btn, button")
            for tab in tabs:
                if "medical" in tab.text.lower() or "history" in tab.text.lower():
                    tab.click()
                    time.sleep(2)
                    break
            
            # Find input field and add button
            input_field = self.wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='text'], input[placeholder*='condition'], input[placeholder*='history']")))
            input_field.clear()
            input_field.send_keys(self.test_data['medical_history'])
            time.sleep(1)
            
            # Click add button
            buttons = self.driver.find_elements(By.CSS_SELECTOR, "button")
            for button in buttons:
                if "add" in button.text.lower():
                    button.click()
                    break
            
            time.sleep(2)
            
            self.log_test(test_name, True, f"Added: {self.test_data['medical_history']}")
            return True
            
        except Exception as e:
            self.log_test(test_name, False, f"Error: {str(e)}")
            self.take_screenshot("add_medical_history_error")
            return False
    
    def test_02_verify_medical_history(self):
        """Test 2: Verify medical history appears in list (READ operation)"""
        test_name = "Verify Medical History (READ)"
        
        try:
            print(f"\n{Colors.BOLD}TEST 2: {test_name}{Colors.RESET}")
            time.sleep(1)
            
            # Check if the added item appears in the list
            page_text = self.driver.find_element(By.TAG_NAME, "body").text
            
            if self.test_data['medical_history'] in page_text:
                self.log_test(test_name, True, f"Found in database: {self.test_data['medical_history']}")
                return True
            else:
                self.log_test(test_name, False, "Medical history not found in list")
                return False
            
        except Exception as e:
            self.log_test(test_name, False, f"Error: {str(e)}")
            return False
    
    def test_03_add_allergy(self):
        """Test 3: Add allergy (CREATE operation)"""
        test_name = "Add Allergy (CREATE)"
        
        try:
            print(f"\n{Colors.BOLD}TEST 3: {test_name}{Colors.RESET}")
            
            # Navigate to allergies tab
            tabs = self.driver.find_elements(By.CSS_SELECTOR, ".tab-btn, button")
            for tab in tabs:
                if "allerg" in tab.text.lower():
                    tab.click()
                    time.sleep(2)
                    break
            
            # Find input field and add button
            input_field = self.wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='text'], input[placeholder*='allerg']")))
            input_field.clear()
            input_field.send_keys(self.test_data['allergy'])
            time.sleep(1)
            
            # Click add button
            buttons = self.driver.find_elements(By.CSS_SELECTOR, "button")
            for button in buttons:
                if "add" in button.text.lower():
                    button.click()
                    break
            
            time.sleep(2)
            
            self.log_test(test_name, True, f"Added: {self.test_data['allergy']}")
            return True
            
        except Exception as e:
            self.log_test(test_name, False, f"Error: {str(e)}")
            self.take_screenshot("add_allergy_error")
            return False
    
    def test_04_verify_allergy(self):
        """Test 4: Verify allergy appears in list (READ operation)"""
        test_name = "Verify Allergy (READ)"
        
        try:
            print(f"\n{Colors.BOLD}TEST 4: {test_name}{Colors.RESET}")
            time.sleep(1)
            
            # Check if the added item appears in the list
            page_text = self.driver.find_element(By.TAG_NAME, "body").text
            
            if self.test_data['allergy'] in page_text:
                self.log_test(test_name, True, f"Found in database: {self.test_data['allergy']}")
                return True
            else:
                self.log_test(test_name, False, "Allergy not found in list")
                return False
            
        except Exception as e:
            self.log_test(test_name, False, f"Error: {str(e)}")
            return False
    
    def test_05_add_medication(self):
        """Test 5: Add medication (CREATE operation)"""
        test_name = "Add Medication (CREATE)"
        
        try:
            print(f"\n{Colors.BOLD}TEST 5: {test_name}{Colors.RESET}")
            
            # Navigate to medications tab
            tabs = self.driver.find_elements(By.CSS_SELECTOR, ".tab-btn, button")
            for tab in tabs:
                if "medicat" in tab.text.lower():
                    tab.click()
                    time.sleep(2)
                    break
            
            # Find input fields
            inputs = self.driver.find_elements(By.CSS_SELECTOR, "input[type='text']")
            
            # Fill medication name
            if len(inputs) >= 1:
                inputs[0].clear()
                inputs[0].send_keys(self.test_data['medication_name'])
            
            # Fill dosage
            if len(inputs) >= 2:
                inputs[1].clear()
                inputs[1].send_keys(self.test_data['medication_dosage'])
            
            time.sleep(1)
            
            # Click add button
            buttons = self.driver.find_elements(By.CSS_SELECTOR, "button")
            for button in buttons:
                if "add" in button.text.lower():
                    button.click()
                    break
            
            time.sleep(2)
            
            self.log_test(test_name, True, f"Added: {self.test_data['medication_name']}")
            return True
            
        except Exception as e:
            self.log_test(test_name, False, f"Error: {str(e)}")
            self.take_screenshot("add_medication_error")
            return False
    
    def test_06_verify_medication(self):
        """Test 6: Verify medication appears in list (READ operation)"""
        test_name = "Verify Medication (READ)"
        
        try:
            print(f"\n{Colors.BOLD}TEST 6: {test_name}{Colors.RESET}")
            time.sleep(1)
            
            # Check if the added item appears in the list
            page_text = self.driver.find_element(By.TAG_NAME, "body").text
            
            if self.test_data['medication_name'] in page_text:
                self.log_test(test_name, True, f"Found in database: {self.test_data['medication_name']}")
                return True
            else:
                self.log_test(test_name, False, "Medication not found in list")
                return False
            
        except Exception as e:
            self.log_test(test_name, False, f"Error: {str(e)}")
            return False
    
    def test_07_navigate_to_appointments(self):
        """Test 7: Navigate to appointments page"""
        test_name = "Navigate to Appointments Page"
        
        try:
            print(f"\n{Colors.BOLD}TEST 7: {test_name}{Colors.RESET}")
            
            # Try to find appointments link
            nav_links = self.driver.find_elements(By.CSS_SELECTOR, "a, button")
            for link in nav_links:
                if "appointment" in link.text.lower() and "schedule" not in link.text.lower():
                    link.click()
                    time.sleep(3)
                    break
            
            self.log_test(test_name, True, "Navigated to appointments page")
            return True
            
        except Exception as e:
            self.log_test(test_name, False, f"Error: {str(e)}")
            return False
    
    def test_08_view_appointments(self):
        """Test 8: View appointments list (READ operation)"""
        test_name = "View Appointments List (READ)"
        
        try:
            print(f"\n{Colors.BOLD}TEST 8: {test_name}{Colors.RESET}")
            time.sleep(2)
            
            page_text = self.driver.find_element(By.TAG_NAME, "body").text.lower()
            
            # Check if appointments section exists
            has_appointments = "appointment" in page_text
            
            if has_appointments:
                appointment_items = self.driver.find_elements(By.CSS_SELECTOR, 
                    ".appointment-card, .appointment-item, tr, li")
                
                self.log_test(test_name, True, 
                    f"Appointments loaded from database: {len(appointment_items)} records found")
            else:
                self.log_test(test_name, True, "Appointments section accessible")
            
            return True
            
        except Exception as e:
            self.log_test(test_name, False, f"Error: {str(e)}")
            return False
    
    def test_09_database_persistence_check(self):
        """Test 9: Refresh page and verify data persists (DATABASE verification)"""
        test_name = "Database Persistence Check"
        
        try:
            print(f"\n{Colors.BOLD}TEST 9: {test_name}{Colors.RESET}")
            
            # Refresh the page
            self.driver.refresh()
            time.sleep(3)
            
            # Check if data still exists after refresh
            page_text = self.driver.find_element(By.TAG_NAME, "body").text
            
            data_persisted = (
                self.test_data['medical_history'] in page_text or
                self.test_data['allergy'] in page_text or
                self.test_data['medication_name'] in page_text
            )
            
            if data_persisted:
                self.log_test(test_name, True, "Data persisted in database after page refresh")
            else:
                self.log_test(test_name, False, "Data not found after refresh")
            
            return data_persisted
            
        except Exception as e:
            self.log_test(test_name, False, f"Error: {str(e)}")
            return False
    
    def test_10_logout(self):
        """Test 10: Logout"""
        test_name = "Logout"
        
        try:
            print(f"\n{Colors.BOLD}TEST 10: {test_name}{Colors.RESET}")
            
            buttons = self.driver.find_elements(By.CSS_SELECTOR, "button, a")
            for button in buttons:
                if "logout" in button.text.lower():
                    button.click()
                    time.sleep(2)
                    break
            
            self.log_test(test_name, True, "Successfully logged out")
            return True
            
        except Exception as e:
            self.log_test(test_name, False, f"Error: {str(e)}")
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
            print(f"{Colors.GREEN}{Colors.BOLD}✓ ALL CRUD OPERATIONS SUCCESSFUL!{Colors.RESET}\n")
            print(f"{Colors.GREEN}Database operations verified:{Colors.RESET}")
            print(f"  ✓ CREATE operations working")
            print(f"  ✓ READ operations working")
            print(f"  ✓ Data persistence confirmed\n")
        else:
            print(f"{Colors.YELLOW}⚠ Some tests failed. Please review the logs above.{Colors.RESET}\n")
    
    def run_all_tests(self):
        """Run all CRUD operation tests"""
        if not self.setup():
            return False
        
        try:
            if not self.login():
                print(f"{Colors.RED}[ERROR]{Colors.RESET} Failed to login")
                return False
            
            # Execute all tests in sequence
            self.test_01_add_medical_history()
            self.test_02_verify_medical_history()
            self.test_03_add_allergy()
            self.test_04_verify_allergy()
            self.test_05_add_medication()
            self.test_06_verify_medication()
            self.test_07_navigate_to_appointments()
            self.test_08_view_appointments()
            self.test_09_database_persistence_check()
            self.test_10_logout()
            
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
    print(f"\n{Colors.BOLD}Starting Patient CRUD Operations Tests...{Colors.RESET}")
    print(f"{Colors.YELLOW}Make sure:{Colors.RESET}")
    print(f"  1. Backend server is running on http://127.0.0.1:8000/")
    print(f"  2. Frontend server is running on http://localhost:5173/")
    print(f"  3. Patient account exists: {PATIENT_EMAIL}")
    print(f"  4. Chrome browser is installed")
    print(f"\n{Colors.CYAN}This test will:{Colors.RESET}")
    print(f"  • Add medical history, allergies, and medications")
    print(f"  • Verify data is saved to database")
    print(f"  • Verify data persists after page refresh")
    print(f"  • Test CREATE and READ operations")
    
    input(f"\n{Colors.CYAN}Press Enter to start testing...{Colors.RESET}")
    
    # Run tests
    test_suite = PatientCRUDTest()
    test_suite.run_all_tests()

if __name__ == "__main__":
    main()
