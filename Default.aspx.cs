using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Data;
using System.Data.SqlClient;
using System.Configuration;
using System.Web.Configuration;

namespace FoodPantry.secure
{
    public partial class Default : System.Web.UI.Page
    {
        string ConnectionString = ConfigurationManager.ConnectionStrings["appString"].ConnectionString;
        protected void Page_Load(object sender, EventArgs e)
        {

            string employeeNumber = string.Empty, eduPersonPrincipalName = string.Empty, mail = string.Empty, affiliation = string.Empty;


            /* Check if the application is running locally for development
             * Retrieve request header information
             */
            if (HttpContext.Current.Request.IsLocal.Equals(true))
            {
                /*The SSO Sign-on page will not appear while running locally. This is only used for development.*/
                //   employeeNumber = "*Put your TUid here*"; 
                employeeNumber = "915290866";
                Session["Authenticated"] = true;

                // MAKE SURE TO CHANGE TO STUDENT WORKER IF TESTING FOR ROLES
                Session["Role"] = "Admin";

                Session["First_Name"] = "Local";
                Session["Access_Net"] = "Local";
                Session["PersonID"] = "31";
                Response.Redirect("Checkout.aspx");
            }
            else
            {
                /*Application is running on server and the user has active Shibboleth session.*/
                employeeNumber = GetShibbolethHeaderAttributes();
            }

            /*Use employee number to get user information from web services and then redirect*/
            GetUserInformation(employeeNumber);

            try
            {
                string demo = (!string.IsNullOrWhiteSpace(ConfigurationManager.AppSettings["demo_mode"].ToString())) ? ConfigurationManager.AppSettings["demo_mode"].ToString().ToLower() : "N/A";
                if (demo.ToLower() == "true")
                {
                    demo_toggle.Checked = true;
                }
                else
                {
                    demo_toggle.Checked = false;
                }
            }
            catch (Exception ex)
            {
                string demo = ex.ToString();
            }



        }
        protected string GetShibbolethHeaderAttributes()
        {
            string employeeNumber = Request.Headers["employeeNumber"]; //Use this to retrieve the user's information via the web services  
            Session["SSO_Attribute_mail"] = Request.Headers["mail"];
            Session["SSO_Attribute_affiliation"] = Request.Headers["affiliation"];
            Session["SSO_Attribute_eduPersonPrincipalName"] = Request.Headers["eduPersonPrincipalName"];
            Session["SSO_Attribute_Unscoped_Affiliation"] = Request.Headers["unscopedaffiliation"];
            Session["SSO_Attribute_employeeNumber"] = employeeNumber;

            return employeeNumber;
        }

        /// <summary>
        /// Use employeeNumber (TUid) to retrieve infromation about the user
        /// from the web services.
        /// </summary>
        /// <param name="employeeNumber">TUid</param>
        protected void GetUserInformation(string employeeNumber)
        {
            if (!string.IsNullOrWhiteSpace(employeeNumber))
            {
                /*Security Session Variable*/
                Session["Authenticated"] = true;

                /* Requesting user's LDAP information via Web Service */
                WebService.LDAPuser Temple_Information = WebService.Webservice.getLDAPEntryByTUID(employeeNumber);

                /* Checking we received something from Web Services*/
                if (Temple_Information != null)
                {
                    /*Populating the Session Object with the user's information*/
                    Session["TU_ID"] = Temple_Information.templeEduID;
                    Session["First_Name"] = Temple_Information.givenName;
                    Session["Last_Name"] = Temple_Information.sn;
                    Session["Email"] = Temple_Information.mail;
                    Session["Title"] = Temple_Information.title;
                    Session["Affiliation_Primary"] = Temple_Information.eduPersonPrimaryAffiliation;
                    Session["Affiliation_Secondary"] = Temple_Information.eduPersonAffiliation;
                    Session["Full_Name"] = Temple_Information.cn;
                    Session["Access_Net"] = Temple_Information.uID;


                    /* If the user is a student, we can request academic information via the Web Service */
                    WebService.StudentObj Student_Information = WebService.Webservice.getStudentInfo(Temple_Information.templeEduID);

                    /* Checking we received something from Web Service and then adding information to the Session Object*/
                    if (Student_Information != null)
                    {
                        Session["School"] = Student_Information.school;
                        Session["Major_1"] = Student_Information.major1;
                        Session["Major_2"] = Student_Information.major2;
                    }
                }
                /*Successful Login - Allowed to be redirected to Home.aspx*/
                //  Response.Redirect("Checkout.aspx");

                if (AuthenticateUser(Temple_Information.uID) == true)
                {

                    Response.Redirect("Checkout.aspx");
                }
                else
                {
                    Server.Transfer("500http.aspx");
                }


            }
            else
            {
                //Error: Couldn't retrieve employeeNumber from request header
                Server.Transfer("500http.aspx");
            }
        }
        public Boolean AuthenticateUser(string accessnet)
        {
            try
            {
                DBConnect objDB = new DBConnect(ConnectionString);
                SqlCommand objCommand = new SqlCommand();


                objCommand.CommandType = CommandType.StoredProcedure;
                objCommand.CommandText = "AuthenticateUser";     // identify the name of the stored procedure to execute
                objCommand.Parameters.AddWithValue("@accessNet", accessnet);

                // Execute the stored procedure using the DBConnect object and the SQLCommand object
                DataSet myDS = objDB.GetDataSetUsingCmdObj(objCommand);

                if (myDS.Tables[0].Rows.Count == 1)
                {
                    string status = myDS.Tables[0].Rows[0]["Status"].ToString();
                    string role = myDS.Tables[0].Rows[0]["RoleType"].ToString();    
                    string personID = myDS.Tables[0].Rows[0]["PersonID"].ToString();    

                    if (status == "Inactive")
                    {
                        return false;
                    }
                    else
                    {
                        Session["Role"] = role;
                        Session["PersonID"] = personID;
                        return true;
                    }
                }
                else
                {
                    return false;
                }

            }
            catch (Exception ex)
            {
                return false;
            }

        }

        protected void demo_toggle_CheckedChanged(object sender, EventArgs e)
        {
            string toggle;
            if (demo_toggle.Checked)
            {
                //  demo mode on
                toggle = "False";
            }
            else
            {
                // Demo mode off
                toggle = "True";
            }
            setDemo(toggle);

        }
        private void setDemo(string toggle)
        {
            try
            {
                if (bool.TryParse(toggle, out bool newValue))
                {
                    Configuration config = WebConfigurationManager.OpenWebConfiguration("~");

                    if (config != null)
                    {
                        config.AppSettings.Settings["demo_mode"].Value = newValue.ToString();
                        config.Save(ConfigurationSaveMode.Modified);
                        Response.Redirect("Default.aspx");
                        //   return "Status saved.";
                    }
                    else
                    {

                        //    return "Config could not be opened.";
                    }
                }

                //  return "Parameter could not be converted to boolean.";
            }
            catch (Exception ex)
            {
                test.Text = ex.ToString();
            }
        }
    }
}
